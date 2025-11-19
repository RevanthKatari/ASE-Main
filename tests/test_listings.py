from http import HTTPStatus

from backend.models import Listing
from tests.factories import listing_payload


def test_listings_start_empty(client, db):
    response = client.get("/api/listings/")
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == []


def test_create_listing_success(client, db, register_user):
    user = register_user()
    payload = listing_payload(owner_id=1)

    response = client.post("/api/listings/", json=payload)
    assert response.status_code == HTTPStatus.CREATED

    data = response.get_json()
    assert data["title"] == payload["title"]
    assert data["owner"]["email"] == user["email"].lower()

    stored = Listing.query.first()
    assert stored is not None
    assert stored.owner.email == user["email"].lower()


def test_create_listing_missing_fields(client, db, register_user):
    register_user()

    response = client.post(
        "/api/listings/",
        json={"title": "Incomplete listing", "owner_id": 1},
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "Missing required fields" in response.get_json()["error"]

