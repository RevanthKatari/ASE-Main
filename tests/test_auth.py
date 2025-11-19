from http import HTTPStatus

from backend.models import User
from tests.factories import user_payload


def test_register_creates_user(client, db):
    payload = user_payload()
    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data["email"] == payload["email"].lower()
    assert "password_hash" not in data

    stored = User.query.filter_by(email=payload["email"].lower()).first()
    assert stored is not None
    assert stored.check_password(payload["password"])


def test_register_rejects_duplicate_email(client, db):
    payload = user_payload(email="duplicate@example.com")
    client.post("/api/auth/register", json=payload)

    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == HTTPStatus.CONFLICT
    assert "Email already registered" in response.get_json()["error"]


def test_login_successful(client, db):
    payload = user_payload(email="login@example.com", password="MySecurePass1!")
    client.post("/api/auth/register", json=payload)

    response = client.post(
        "/api/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )

    assert response.status_code == HTTPStatus.OK
    data = response.get_json()
    assert data["email"] == payload["email"].lower()


def test_login_fails_with_wrong_password(client, db):
    payload = user_payload(email="wrongpass@example.com")
    client.post("/api/auth/register", json=payload)

    response = client.post(
        "/api/auth/login",
        json={"email": payload["email"], "password": "incorrect"},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "Invalid email or password" in response.get_json()["error"]

