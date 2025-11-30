import os
from datetime import datetime
from http import HTTPStatus
from flask import Blueprint, jsonify, request

from ..database import db
from ..models import CSEvent
from ..services.cs_event_scraper import CSEventScraper

cs_events_bp = Blueprint("cs_events", __name__)

@cs_events_bp.get("/")
def list_cs_events():
    """Get all CS events from database"""
    from sqlalchemy import case
    # Order by event_date (nulls last), then by scraped_at desc
    events = CSEvent.query.order_by(
        case((CSEvent.event_date.is_(None), 1), else_=0),
        CSEvent.event_date.asc(),
        CSEvent.scraped_at.desc()
    ).all()
    
    events_data = [{
        'id': e.id,
        'title': e.title,
        'description': e.description,
        'abstract': e.abstract,
        'event_date': e.event_date.isoformat() if e.event_date else None,
        'event_time': e.event_time,
        'location': e.location,
        'event_url': e.event_url,
        'presenter': e.presenter,
        'workshop_outline': e.workshop_outline,
        'prerequisites': e.prerequisites,
        'biography': e.biography,
        'registration_link': e.registration_link,
        'last_updated': e.last_updated.isoformat()
    } for e in events]
    
    return jsonify(events_data), HTTPStatus.OK

@cs_events_bp.get("/<int:event_id>")
def get_cs_event(event_id):
    """Get a single CS event by ID"""
    event = db.session.get(CSEvent, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), HTTPStatus.NOT_FOUND
    
    event_data = {
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'abstract': event.abstract,
        'event_date': event.event_date.isoformat() if event.event_date else None,
        'event_time': event.event_time,
        'location': event.location,
        'event_url': event.event_url,
        'presenter': event.presenter,
        'workshop_outline': event.workshop_outline,
        'prerequisites': event.prerequisites,
        'biography': event.biography,
        'registration_link': event.registration_link,
        'last_updated': event.last_updated.isoformat()
    }
    
    return jsonify(event_data), HTTPStatus.OK

@cs_events_bp.post("/scrape")
def scrape_cs_events():
    """Manually trigger scraping of CS events"""
    # Optional API key authentication (set CS_SCRAPE_API_KEY env var to enable)
    api_key = request.headers.get('X-API-Key')
    expected_key = os.getenv('CS_SCRAPE_API_KEY')
    if expected_key and api_key != expected_key:
        return jsonify({"error": "Unauthorized"}), HTTPStatus.UNAUTHORIZED
    
    try:
        scraper = CSEventScraper()
        fetched_events = scraper.fetch_events()
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Scraping failed',
            'message': str(e)
        }), HTTPStatus.INTERNAL_SERVER_ERROR
    
    added_count = 0
    updated_count = 0
    errors = []
    
    for event_data in fetched_events:
        try:
            # Check if event already exists (by title and date)
            existing = None
            if event_data.get('event_date'):
                existing = CSEvent.query.filter_by(
                    title=event_data['title'],
                    event_date=event_data['event_date']
                ).first()
            else:
                # If no date, match by title and URL
                existing = CSEvent.query.filter_by(
                    title=event_data['title'],
                    event_url=event_data.get('event_url')
                ).first()
            
            if existing:
                # Update existing event
                existing.description = event_data.get('description')
                existing.abstract = event_data.get('abstract')
                existing.event_time = event_data.get('event_time')
                existing.location = event_data.get('location')
                existing.event_url = event_data.get('event_url')
                existing.presenter = event_data.get('presenter')
                existing.workshop_outline = event_data.get('workshop_outline')
                existing.prerequisites = event_data.get('prerequisites')
                existing.biography = event_data.get('biography')
                existing.registration_link = event_data.get('registration_link')
                existing.raw_data = event_data.get('raw_data')
                existing.last_updated = datetime.utcnow()
                updated_count += 1
            else:
                # Create new event
                new_event = CSEvent(
                    title=event_data['title'],
                    description=event_data.get('description'),
                    abstract=event_data.get('abstract'),
                    event_date=event_data.get('event_date'),
                    event_time=event_data.get('event_time'),
                    location=event_data.get('location'),
                    event_url=event_data.get('event_url'),
                    presenter=event_data.get('presenter'),
                    workshop_outline=event_data.get('workshop_outline'),
                    prerequisites=event_data.get('prerequisites'),
                    biography=event_data.get('biography'),
                    registration_link=event_data.get('registration_link'),
                    raw_data=event_data.get('raw_data')
                )
                db.session.add(new_event)
                added_count += 1
        except Exception as e:
            errors.append(f"Error processing event '{event_data.get('title', 'Unknown')}': {str(e)}")
            continue
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Database error',
            'message': str(e)
        }), HTTPStatus.INTERNAL_SERVER_ERROR
    
    response = {
        'message': 'Scraping completed',
        'added': added_count,
        'updated': updated_count,
        'total': len(fetched_events)
    }
    
    if errors:
        response['errors'] = errors
    
    return jsonify(response), HTTPStatus.OK

