from datetime import datetime, timezone
from http import HTTPStatus

from flask import Blueprint, jsonify, request

from ..database import db
from ..models import Event, User
from ..schemas import EventSchema

events_bp = Blueprint("events", __name__)
event_schema = EventSchema()
event_list_schema = EventSchema(many=True)


@events_bp.get("/")
def list_events():
    events = Event.query.order_by(Event.start_time.asc()).all()
    return jsonify(event_list_schema.dump(events)), HTTPStatus.OK


@events_bp.post("/")
def create_event():
    payload = request.get_json() or {}

    required_fields = {
        "title": payload.get("title"),
        "description": payload.get("description"),
        "start_time": payload.get("start_time"),
        "location": payload.get("location"),
        "created_by_id": payload.get("created_by_id"),
    }
    
    # Optional iframe_url
    iframe_url = payload.get("iframe_url", "").strip() or None
    missing = [name for name, value in required_fields.items() if value in (None, "")]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            HTTPStatus.BAD_REQUEST,
        )

    creator = db.session.get(User, required_fields["created_by_id"])
    if not creator:
        return jsonify({"error": "Creator not found"}), HTTPStatus.NOT_FOUND

    try:
        start_time = datetime.fromisoformat(required_fields["start_time"])
    except ValueError:
        return (
            jsonify({"error": "start_time must be ISO 8601 format"}),
            HTTPStatus.BAD_REQUEST,
        )

    event = Event(
        title=required_fields["title"],
        description=required_fields["description"],
        start_time=start_time,
        location=required_fields["location"],
        iframe_url=iframe_url,
        creator=creator,
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event_schema.dump(event)), HTTPStatus.CREATED


@events_bp.delete("/<int:event_id>")
def delete_event(event_id):
    """Delete an event. Only the creator or a helper can delete."""
    payload = request.get_json() or {}
    user_id = payload.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), HTTPStatus.BAD_REQUEST
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), HTTPStatus.NOT_FOUND
    
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), HTTPStatus.NOT_FOUND
    
    # Authorization: creator can delete their own event, helpers can delete any event
    if event.created_by_id != user_id and user.role == "student":
        return jsonify({"error": "You can only delete your own events"}), HTTPStatus.FORBIDDEN
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({"message": "Event deleted successfully"}), HTTPStatus.OK
