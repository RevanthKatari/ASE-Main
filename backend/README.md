# UniLife – Backend

Flask-based REST API powering the UniLife MVP. Provides core endpoints for authentication, housing listings, and community events.

## Getting Started

### 1. Create virtual environment
```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install dependencies
```powershell
pip install -r backend/requirements.txt
```

### 3. Run the application (from project root)
```powershell
python -m backend.app
```
The API listens on `http://127.0.0.1:5000/` and exposes a `/health` endpoint for quick checks.

### 4. Seed local data (optional)
```powershell
python -m backend.seed_data
```
This resets the SQLite database located at `backend/instance/app.db` and inserts sample users, listings, and events.

### 5. Run tests
```powershell
pytest
```
Tests exercise registration/login, listing creation, and event creation flows using an in-memory SQLite database.

## Available Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user (email + password) |
| `GET` | `/api/listings/` | Retrieve housing listings |
| `POST` | `/api/listings/` | Create housing listing (requires `owner_id`) |
| `GET` | `/api/events/` | Retrieve events |
| `POST` | `/api/events/` | Create event (requires `created_by_id`) |

All create endpoints expect JSON payloads. Authentication tokens are not yet implemented; responses return user metadata only (no password hashes).

## Project Structure
```
backend/
├── app.py             # Flask application factory
├── config.py          # Environment and DB configuration
├── database.py        # SQLAlchemy + Bcrypt instances
├── models.py          # SQLAlchemy models (User, Listing, Event, Comment)
├── routes/            # Blueprint modules for auth, listings, events
├── schemas.py         # Marshmallow schemas for serialization
├── seed_data.py       # Utility to seed sample data
├── requirements.txt
└── README.md
```

## Next Steps
- Add automated tests for auth, listings, and events endpoints.
- Integrate token-based authentication for session management.
- Expand validation and error handling once frontend requirements mature.

