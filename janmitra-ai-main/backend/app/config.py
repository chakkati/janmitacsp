import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "JanMitra AI Backend"
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # React default
        "http://localhost:3000",
        "https://janmitra-ai.vercel.app",  # Production Vercel domain stub
    ]
    
    # Database Settings
    # Fallback to local SQLite file for development if Postgres is not configured
    DATABASE_URL: str = Field(
        default="sqlite:///./janmitra.db",
        validation_alias="DATABASE_URL"
    )
    
    # Supabase Settings (used for Auth / storage)
    SUPABASE_URL: str = Field(default="", validation_alias="SUPABASE_URL")
    SUPABASE_KEY: str = Field(default="", validation_alias="SUPABASE_KEY")
    
    # Vector Database Settings
    CHROMA_PERSIST_DIRECTORY: str = Field(default="./chroma_db", validation_alias="CHROMA_PERSIST_DIRECTORY")
    
    # LLM & AI Settings
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="gemma2:9b", validation_alias="OLLAMA_MODEL")
    GROQ_API_KEY: str = Field(default="", validation_alias="GROQ_API_KEY")
    
    # OCR and Voice Settings
    UPLOAD_DIR: str = Field(default="./uploads", validation_alias="UPLOAD_DIR")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
