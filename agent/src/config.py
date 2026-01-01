import os
from dotenv import load_dotenv

# Load environment variables from .env file
# override=False ensures system environment variables take precedence
load_dotenv(override=False)

class Config:
    """
    Configuration class to load and validate environment variables.
    """
    
    # LLM Configuration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower() # openai, azure_openai, anthropic, etc.
    
    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "gpt-4o")
    OPENAI_API_BASE = os.getenv("OPENAI_API_BASE") # Optional: for proxies or Azure
    
    # Azure OpenAI (Example of another provider params)
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
    
    # Common
    TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
    VERBOSE = os.getenv("VERBOSE", "false").lower() == "true"
    
    # List of tools that should output detailed logs to console. Comma separated.
    # e.g. "create_directory,read_file" or "all"
    VERBOSE_TOOLS = [t.strip() for t in os.getenv("VERBOSE_TOOLS", "").split(",") if t.strip()]

    # Project Configuration
    # Automatically deduce project root: agent/src/config.py -> agent/src -> agent -> how_it_work (root)
    _root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    PROJECT_ROOT = os.path.join(_root_dir, "workspace")

    @classmethod
    def validate(cls):
        """
        Validate necessary configuration based on the selected provider.
        """
        # Ensure PROJECT_ROOT exists (sanity check)
        if not os.path.exists(cls.PROJECT_ROOT):
             # Try to create workspace directory if it doesn't exist, as it's a specific working dir
             try:
                 os.makedirs(cls.PROJECT_ROOT, exist_ok=True)
                 print(f"Created workspace directory at: {cls.PROJECT_ROOT}")
             except Exception as e:
                 print(f"Debug: Checking existence of path: {repr(cls.PROJECT_ROOT)}")
                 raise ValueError(f"PROJECT_ROOT does not exist and could not be created: {cls.PROJECT_ROOT}. Error: {e}")

        if cls.LLM_PROVIDER == "openai":
            if not cls.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required for 'openai' provider.")
        elif cls.LLM_PROVIDER == "azure_openai":
            if not cls.AZURE_OPENAI_API_KEY or not cls.AZURE_OPENAI_ENDPOINT:
                raise ValueError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT are required for 'azure_openai' provider.")
        # Add more validations as needed for other providers
