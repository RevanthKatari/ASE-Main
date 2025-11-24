import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .config import Config
from .database import bcrypt, db
from .models import Event, Listing, User  # noqa: F401
from .routes import register_blueprints


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Allow CORS from frontend domain (set via environment variable)
    # Defaults to localhost for local development
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:4200')
    allowed_origins = [frontend_url, 'http://localhost:4200']
    CORS(app, origins=allowed_origins, supports_credentials=True)
    
    db.init_app(app)
    bcrypt.init_app(app)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    register_blueprints(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.get("/uploads/<path:filename>")
    def serve_upload(filename):
        upload_dir = os.path.join(app.root_path, "uploads")
        return send_from_directory(upload_dir, filename)

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

