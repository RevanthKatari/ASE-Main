import os
from pathlib import Path


class Config:
    """Base application configuration."""

    BASE_DIR = Path(__file__).resolve().parent
    database_url = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}",
    )
    # Convert postgres:// to postgresql:// for SQLAlchemy compatibility
    # Railway and some providers use postgres:// but SQLAlchemy requires postgresql://
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    BCRYPT_LOG_ROUNDS = int(os.getenv("BCRYPT_LOG_ROUNDS", "12"))


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

