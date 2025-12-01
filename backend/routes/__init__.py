from .auth import auth_bp
from .events import events_bp
from .listings import listings_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(listings_bp, url_prefix="/api/listings")
    app.register_blueprint(events_bp, url_prefix="/api/events")

