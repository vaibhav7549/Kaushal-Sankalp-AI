"""Application configuration from environment variables."""

from __future__ import annotations

import os
from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App-wide settings, loaded from environment / .env file."""

    # --- Project ---
    PROJECT_NAME: str = "Kaushal Sankalp AI"
    VERSION: str = "0.1.0"
    PS_ID: str = "SIH26241"
    TEAM: str = "The BIG(O)"
    TEAM_ID: str = "173175"

    # --- Database ---
    DB_MODE: str = "sqlite"  # "sqlite" or "postgres"
    DATABASE_URL: str = "" # computed in db_url

    # --- LLM ---
    GEMINI_API_KEY: str = ""

    # --- Bhashini ---
    BHASHINI_USER_ID: str = ""
    BHASHINI_API_KEY: str = ""
    BHASHINI_PIPELINE_ID: str = ""

    # --- Security ---
    HASH_SALT: str = "kaushal-sankalp-demo-salt-26241"
    JWT_SECRET: str = "kaushal-sankalp-jwt-secret-dev"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # --- Server ---
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 5173

    # --- Demo ---
    DEMO_OTP: str = "123456"
    SEED_ON_START: bool = True
    SEED_VALUE: int = 26241

    # --- Paths ---
    BASE_DIR: str = str(Path(__file__).resolve().parent.parent)
    DATA_DIR: str = str(Path(__file__).resolve().parent.parent / "data")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY)

    @property
    def has_bhashini(self) -> bool:
        return bool(self.BHASHINI_API_KEY and self.BHASHINI_USER_ID)

    @property
    def db_url(self) -> str:
        if self.DB_MODE == "postgres" and self.DATABASE_URL:
            return self.DATABASE_URL
        
        # Absolute path for sqlite
        db_path = Path(self.DATA_DIR) / "kaushal_sankalp.db"
        # On windows, we need three slashes for absolute path in URI
        path_str = str(db_path).replace("\\", "/")
        return f"sqlite+aiosqlite:///{path_str}"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
