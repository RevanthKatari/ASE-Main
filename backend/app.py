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
        helper_exists = User.query.filter_by(email="helper@unilife.ca").first()
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

