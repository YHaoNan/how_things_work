import logging
from typing import List, Any, Dict, Optional, Union

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import BaseTool
from langgraph.prebuilt import create_react_agent
from langgraph.graph.state import CompiledStateGraph
from langgraph.checkpoint.memory import MemorySaver

from src.config import Config

logger = logging.getLogger(__name__)

class AgentShell:
    """
    A configurable Agent Shell that abstracts the underlying LangChain/LangGraph agent construction.
    It allows easy configuration of system prompts and tools.
    """
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        self.tools: List[BaseTool] = []
        self.system_prompt = "You are a helpful AI assistant."
        self.agent_executor: Optional[Union[CompiledStateGraph, Any]] = None
        self.verbose = False
        
        # Initialize memory checkpointer for LangGraph
        self.checkpointer = MemorySaver()
        self.thread_id = "default_session"
        
        # Manual history for fallback (no-tools) mode
        self.chat_history = [] 

    def set_system_prompt(self, prompt: str):
        """
        Sets the system prompt for the agent.
        """
        self.system_prompt = prompt

    def add_tools(self, tools: List[BaseTool]):
        """
        Adds a list of tools to the agent.
        """
        self.tools.extend(tools)
    
    def set_verbose(self, verbose: bool):
        self.verbose = verbose

    def build(self):
        """
        Builds the agent executor (LangGraph) based on the current configuration.
        """
        # If tools are provided, we use the prebuilt React agent from LangGraph
        if self.tools:
            # create_react_agent handles the prompt and tool binding automatically
            # debug=False prevents automatic console printing by LangGraph
            self.agent_executor = create_react_agent(
                model=self.llm,
                tools=self.tools,
                prompt=self.system_prompt,
                checkpointer=self.checkpointer,
                debug=False 
            )
        else:
            # If no tools, we don't build a complex graph, 
            # we will handle it as a simple chain in run()
            self.agent_executor = None

    def run(self, input_message: str) -> Dict[str, Any]:
        """
        Run the agent with the input message.
        Returns a dictionary containing the output.
        """
        logger.info(f"User Input: {input_message}")
        
        if self.tools:
            if not self.agent_executor:
                self.build()
            
            # LangGraph expects 'messages' in the input state
            inputs = {"messages": [("user", input_message)]}
            config = {"configurable": {"thread_id": self.thread_id}}
            
            # Use stream to show intermediate steps (thinking process)
            print("\n🔵 Agent Thinking Process:")
            final_state = None
            
            # stream_mode="values" returns the state after each node
            for event in self.agent_executor.stream(inputs, config=config, stream_mode="values"):
                final_state = event
                messages = event.get("messages", [])
                if messages:
                    last_msg = messages[-1]
                    
                    # Log raw message for debugging
                    logger.debug(f"Event Message: {last_msg}")

                    # Print tool calls
                    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
                        for tool_call in last_msg.tool_calls:
                            # Log full details to file
                            logger.info(f"Tool Call: {tool_call['name']} Args: {tool_call['args']}")
                            
                            # Console output
                            print(f"  🛠️  Calling Tool: {tool_call['name']}...")
                            
                            # Detailed verbose output if configured
                            if "all" in Config.VERBOSE_TOOLS or tool_call['name'] in Config.VERBOSE_TOOLS:
                                print(f"     Args: {tool_call['args']}")

                    # Print tool outputs
                    if hasattr(last_msg, "type") and last_msg.type == "tool":
                         # Log full output to file
                         logger.info(f"Tool Output ({last_msg.name}): {last_msg.content}")
                         
                         # Console output
                         print(f"  ✅ Tool Output Received ({last_msg.name})")
                         
                         # Detailed verbose output if configured
                         if "all" in Config.VERBOSE_TOOLS or last_msg.name in Config.VERBOSE_TOOLS:
                             content_preview = last_msg.content
                             if len(content_preview) > 500:
                                 content_preview = content_preview[:500] + "... [truncated]"
                             print(f"     Output: {content_preview}")

            print("🔵 Thinking Complete.\n")
            
            # The output state contains 'messages'. The last message is the AI's response.
            if final_state:
                messages = final_state.get("messages", [])
                if messages:
                    last_message = messages[-1]
                    logger.info(f"Agent Output: {last_message.content}")
                    return {"output": last_message.content}
            
            logger.warning("No response generated.")
            return {"output": "No response generated."}
        else:
            # Simple Chain execution (when no tools are defined)
            # Manually manage history
            self.chat_history.append(("user", input_message))
            
            # Construct messages with history
            messages = [("system", self.system_prompt)] + self.chat_history
            
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | self.llm
            response = chain.invoke({})
            
            # Append AI response to history
            self.chat_history.append(("assistant", response.content))
            
            logger.info(f"Agent Output: {response.content}")
            # Normalize response to match AgentExecutor output format
            return {"output": response.content}
