from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI, AzureChatOpenAI
# You can import other providers here, e.g. from langchain_anthropic import ChatAnthropic

from src.config import Config

class LLMFactory:
    """
    Factory class to create LLM instances based on configuration.
    Shields the core logic from specific LLM provider implementation details.
    """

    @staticmethod
    def create_llm() -> BaseChatModel:
        """
        Creates and returns a configured LLM instance.
        """
        Config.validate()
        
        provider = Config.LLM_PROVIDER
        
        if provider == "openai":
            return ChatOpenAI(
                api_key=Config.OPENAI_API_KEY,
                model=Config.OPENAI_MODEL_NAME,
                temperature=Config.TEMPERATURE,
                base_url=Config.OPENAI_API_BASE
            )
        
        elif provider == "azure_openai":
            return AzureChatOpenAI(
                api_key=Config.AZURE_OPENAI_API_KEY,
                azure_endpoint=Config.AZURE_OPENAI_ENDPOINT,
                azure_deployment=Config.AZURE_OPENAI_DEPLOYMENT_NAME,
                temperature=Config.TEMPERATURE,
                api_version="2023-05-15" # You might want to make this configurable too
            )
            
        # Add other providers here (e.g., Anthropic, Google VertexAI, etc.)
        # elif provider == "anthropic":
        #     return ChatAnthropic(...)

        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
