import sys
from src.config import Config
from src.llm import LLMFactory
from src.logger import setup_logger

def initialize_components():
    """
    Initializes configuration, Logger and LLM. 
    Exits the program if initialization fails.
    """
    try:
        # 1. Validate Configuration
        Config.validate()
        
        # 2. Setup Logger
        # We don't pass Config.VERBOSE here because we want to control console output manually
        # Logs will always go to agent.log
        setup_logger(log_file_path="agent.log", verbose=False)
        
        # Print Startup Banner (This is intended for the user, so we use print)
        print("\n" + "="*50)
        print(f"🤖 How Things Work Agent Initialized")
        print(f"{'='*50}")
        print(f"• LLM Provider:      {Config.LLM_PROVIDER}")
        print(f"• Model Name:        {Config.OPENAI_MODEL_NAME if Config.LLM_PROVIDER == 'openai' else 'N/A'}")
        print(f"• Work Directory:    {Config.PROJECT_ROOT}")
        print(f"• Log File:          agent.log")
        print("="*50 + "\n")

        # 3. Create LLM Instance
        llm = LLMFactory.create_llm()
        return llm
        
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("Please check your .env file.")
        sys.exit(1)
    except Exception as e:
        print(f"Failed to initialize: {e}")
        sys.exit(1)
