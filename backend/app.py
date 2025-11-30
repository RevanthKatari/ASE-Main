import os
import atexit

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import Config
from .database import bcrypt, db
from .models import Event, Listing, User, CSEvent  # noqa: F401
from .routes import register_blueprints

# Global scheduler instance
_scheduler = None


def start_cs_events_scheduler(app: Flask):
    """Start the CS events scheduler. Should be called once in the master process."""
    global _scheduler
    
    if _scheduler is not None:
        print("⚠️  Scheduler already started, skipping...")
        return
    
    try:
        _scheduler = BackgroundScheduler()
        
        def scrape_cs_events_job():
            """Background job to scrape CS events"""
            with app.app_context():
                try:
                    from .services.cs_event_scraper import CSEventScraper
                    from .database import db
                    from .models import CSEvent
                    from datetime import datetime
                    
                    scraper = CSEventScraper()
                    fetched_events = scraper.fetch_events()
                    
                    added_count = 0
                    updated_count = 0
                    
                    for event_data in fetched_events:
                        try:
                            existing = None
                            if event_data.get('event_date'):
                                existing = CSEvent.query.filter_by(
                                    title=event_data['title'],
                                    event_date=event_data['event_date']
                                ).first()
                            else:
                                existing = CSEvent.query.filter_by(
                                    title=event_data['title'],
                                    event_url=event_data.get('event_url')
                                ).first()
                            
                            if existing:
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
                            print(f"Error processing event in scheduled job: {e}")
                            continue
                    
                    db.session.commit()
                    print(f"✅ CS Events scraping job completed: {added_count} added, {updated_count} updated")
                except Exception as e:
                    print(f"❌ Error in CS Events scraping job: {e}")
                    import traceback
                    traceback.print_exc()
        
        # Schedule job to run daily at 2 AM
        _scheduler.add_job(
            func=scrape_cs_events_job,
            trigger=CronTrigger(hour=2, minute=0),
            id='scrape_cs_events',
            name='Scrape CS Events from UWindsor',
            replace_existing=True
        )
        _scheduler.start()
        print("✅ CS Events scheduler started")
        
        # Shut down scheduler when app exits
        atexit.register(lambda: _scheduler.shutdown() if _scheduler else None)
    except Exception as e:
        print(f"⚠️  Warning: Could not start scheduler: {e}")
        import traceback
        traceback.print_exc()


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Allow CORS from frontend domain (set via environment variable)
    # Defaults to localhost for local development
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:4200')
    # Support both with and without trailing slash
    frontend_url_clean = frontend_url.rstrip('/')
    allowed_origins = [
        frontend_url_clean,
        f'{frontend_url_clean}/',
        'http://localhost:4200',
        'http://localhost:4200/'
    ]
    # Remove duplicates while preserving order
    allowed_origins = list(dict.fromkeys(allowed_origins))
    CORS(app, origins=allowed_origins, supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])
    
    db.init_app(app)
    bcrypt.init_app(app)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        
        # Seed initial data if helper account doesn't exist
        from .models import User
        helper_exists = User.query.filter_by(email="helper@windsorhub.ca").first()
        if not helper_exists:
            try:
                from .seed_data import seed
                seed()
                print("✅ Seed data created successfully (helper account, sample listings, events)")
            except Exception as e:
                print(f"⚠️  Warning: Could not seed data: {e}")
                import traceback
                traceback.print_exc()

    register_blueprints(app)

    # Scheduler will be started by gunicorn_config.py in the master process
    # For development mode (not using gunicorn), start scheduler here
    if os.getenv('FLASK_ENV') == 'development' and os.getenv('ENABLE_SCHEDULER', 'true').lower() == 'true':
        start_cs_events_scheduler(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.get("/uploads/<path:filename>")
    def serve_upload(filename):
        upload_dir = os.path.join(app.root_path, "uploads")
        # Create uploads directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        # Add CORS headers for image serving
        response = send_from_directory(upload_dir, filename)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Cache-Control', 'public, max-age=31536000')
        return response

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

