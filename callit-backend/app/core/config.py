from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CallIt API"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/callit"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_VIDEO_SIZE_MB: int = 100
    
    # Sparks System
    DAILY_STREAK_BONUS_BASE: int = 10
    STREAK_MULTIPLIER_MAX: float = 3.0
    PREDICTION_CREATION_COST: int = 5
    CORRECT_PREDICTION_REWARD: int = 20
    REACTION_SPARKS: int = 1
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
