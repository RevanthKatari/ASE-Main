import os
import multiprocessing

def when_ready(server):
    """Called just after the server is started - runs only in master process."""
    # Start CS Events scheduler in the master process
    # This ensures only one scheduler instance runs, even with multiple workers
    try:
        from backend.app import app, start_cs_events_scheduler
        
        with app.app_context():
            start_cs_events_scheduler(app)
            print("✅ CS Events scheduler initialized in gunicorn master process")
    except Exception as e:
        print(f"⚠️  Warning: Could not start scheduler in gunicorn: {e}")
        import traceback
        traceback.print_exc()

# Worker configuration
workers = int(os.getenv('WEB_CONCURRENCY', multiprocessing.cpu_count() * 2 + 1))
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
timeout = 120  # Increase timeout for scraping operations
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv('LOG_LEVEL', 'info')

