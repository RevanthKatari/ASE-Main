from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from backend.models import Event
from tests.factories import event_payload


def test_events_start_empty(client, db):
    response = client.get("/api/events/")
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == []


def test_create_event_success(client, db, register_user):
    register_user()
    start_time = (datetime.now(timezone.utc) + timedelta(days=1)).replace(microsecond=0).isoformat()
    payload = event_payload(created_by_id=1, start_time=start_time)

    response = client.post("/api/events/", json=payload)
    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data["title"] == payload["title"]

    returned_start = data["start_time"].replace("Z", "+00:00")
    returned_dt = datetime.fromisoformat(returned_start)
    expected_dt = datetime.fromisoformat(start_time).replace(tzinfo=None)
    assert returned_dt == expected_dt

    stored = Event.query.first()
    assert stored is not None


def test_create_event_requires_iso_timestamp(client, db, register_user):
    register_user()
    payload = event_payload(created_by_id=1, start_time="not-a-date")

    response = client.post("/api/events/", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "ISO 8601" in response.get_json()["error"]

