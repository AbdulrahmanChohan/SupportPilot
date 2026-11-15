"""
SupportPilot: Core Configuration Module
Manages environment variables, model parameters, and operational hyperparameters.
"""

from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "SupportPilot"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Azure AI Foundry Configuration
    AZURE_AI_ENDPOINT: str = "https://your-resource-name.services.ai.azure.com/openai/v1/responses"
    AZURE_AI_KEY: Optional[str] = None
    AZURE_MODEL_NAME: str = "gpt-5-mini"

    # Retrieval & Generation Hyperparameters
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    MAX_OUTPUT_TOKENS: int = 180
    RETRIEVAL_TOP_K: int = 3
    SIMILARITY_THRESHOLD: float = 0.40
    RRF_K: int = 60

    # Operational & Safety Controls
    RUN_LIVE_EVALUATION: bool = False
    MOCK_MODE: bool = False
    ALLOW_GENERAL_QUESTIONS: bool = True

    @property
    def is_azure_live(self) -> bool:
        """Determines if Azure AI Foundry is actively configured with a valid endpoint."""
        return bool(
            self.AZURE_AI_KEY
            and self.AZURE_AI_ENDPOINT
            and "your-resource-name" not in self.AZURE_AI_ENDPOINT
            and not self.MOCK_MODE
        )

    # Data Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    POLICIES_PATH: Path = BASE_DIR / "data" / "policies" / "policies.json"
    ORDERS_PATH: Path = BASE_DIR / "data" / "orders" / "orders.json"
    REFUNDS_PATH: Path = BASE_DIR / "data" / "orders" / "refund_requests.json"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
