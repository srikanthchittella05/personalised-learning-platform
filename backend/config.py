from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./learningdb.db"
    secret_key: str = "supersecretkey-change-in-production-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
