import os
import sys

# Add project root to python path to ensure imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.tools import tool
from src.config import Config
from src.agent import AgentShell
from src.cli import CLI
from src.bootstrap import initialize_components

from src.utils import load_text_file
from src.tools import ALL_TOOLS

def main():
    # 1. Initialize Core Components (Config & LLM)
    llm = initialize_components()

    # 2. Setup Agent
    agent = AgentShell(llm)

    agent.set_verbose(Config.VERBOSE)

    # --- USER CONFIGURATION AREA ---
    
    # Load system prompt from file
    # Adjusted path: prompts is in project root, not src/prompts based on previous context
    prompts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "prompts")
    system_prompt_path = os.path.join(prompts_dir, "system.md")
    
    system_prompt = load_text_file(
        system_prompt_path, 
        default_content="You are a helpful AI assistant."
    )
    agent.set_system_prompt(system_prompt)
    
    # Register Tools
    agent.add_tools(ALL_TOOLS)
    
    # 3. Build & Run CLI
    agent.build()
    
    # Automatically start working on the project directory
    initial_instruction = (
        f"Please analyze the project directory at '{Config.PROJECT_ROOT}' "
        "and tell me what you see or if there are any pending tasks."
    )
    CLI(agent).start(initial_input=initial_instruction)

if __name__ == "__main__":
    main()
