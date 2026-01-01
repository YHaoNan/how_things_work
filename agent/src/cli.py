from typing import Any
from src.agent import AgentShell

class CLI:
    """
    Command Line Interface for the Agent.
    Handles user interaction loop.
    """
    def __init__(self, agent: AgentShell):
        self.agent = agent

    def start(self, initial_input: str = None):
        """
        Starts the interactive CLI loop.
        
        Args:
            initial_input: Optional initial instruction to kick off the agent immediately.
        """
        print("\nAgent is ready! (Type 'exit' to quit)")
        print("-" * 50)
        
        # Handle initial input if provided
        if initial_input:
            print(f"\nUser (Auto): {initial_input}")
            try:
                result = self.agent.run(initial_input)
                output = result.get("output")
                print(f"\nAgent: {output}")
            except Exception as e:
                print(f"\nError occurred during initial execution: {e}")

        while True:
            try:
                user_input = input("\nUser: ").strip()
                if not user_input:
                    continue
                    
                if user_input.lower() in ["exit", "quit"]:
                    print("Goodbye!")
                    break
                
                # Run the agent
                result = self.agent.run(user_input)
                
                # Output the result
                output = result.get("output")
                print(f"\nAgent: {output}")
                
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"\nError occurred: {e}")
