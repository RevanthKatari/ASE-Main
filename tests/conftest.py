import sys
from pathlib import Path

import pytest

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import create_app
from backend.config import TestConfig
from backend.database import db as _db
from tests.factories import user_payload


@pytest.fixture(scope="session")
def app():
    app = create_app(TestConfig)
    return app


@pytest.fixture(scope="function")
def db(app):
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app, db):
    return app.test_client()


@pytest.fixture()
def register_user(client):
    def _register(**overrides):
        payload = user_payload(**overrides)
        client.post("/api/auth/register", json=payload)
        return payload

    return _register

