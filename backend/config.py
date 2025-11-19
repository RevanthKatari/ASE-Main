import os
from pathlib import Path


class Config:
    """Base application configuration."""

    BASE_DIR = Path(__file__).resolve().parent
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    BCRYPT_LOG_ROUNDS = int(os.getenv("BCRYPT_LOG_ROUNDS", "12"))


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

