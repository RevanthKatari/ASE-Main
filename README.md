# UniLife (MVP)

Model project for COMP-8117 Assignment 3. Focuses on delivering a narrow, evidence-backed MVP that helps newcomers access verified housing listings and community events.

## Repository Layout

```
.
├── backend/        # Flask REST API (login, listings, events)
├── frontend/       # Angular SPA (login, listings, events UI)
└── README.md       # Project overview
```

## Getting Started

1. Create a Python virtual environment (from project root):
   ```powershell
   python -m venv .venv
   .venv\Scripts\activate
   ```
2. Install backend dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
3. Seed sample data (optional but recommended):
   ```powershell
   python -m backend.seed_data
   ```
4. Start the API:
   ```powershell
   python -m backend.app
   ```
   Health check: `http://127.0.0.1:5000/health`

5. Run the automated tests any time:
   ```powershell
   pytest
   ```

### Frontend (Angular SPA)

1. Install Node.js LTS (if not already available):
   ```powershell
   winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
   ```
   Re-open your shell or append `C:\Program Files\nodejs` to `PATH` so `node`, `npm`, and `npx` resolve.

2. Install dependencies & run the dev server:
   ```powershell
   cd frontend/windsor-community-hub
   npm install
   npm start
   ```
   Visit `http://localhost:4200/`. The app expects the Flask API at `http://localhost:5000`.

3. Produce a production build:
   ```powershell
   npm run build
   ```
   Artifacts land in `frontend/windsor-community-hub/dist/`.

## Current Scope (Mid-Term)

- Authentication: Email + password login/register (token-less for now).
- Housing Listings: CRUD skeleton (GET + POST implemented).
- Events: Upcoming events listing + creation.
- Evidence Log: Track how each feature ties back to surveys/interviews (documented separately).

## Using the API (sample calls)

```powershell
# Register a user
curl -X POST http://127.0.0.1:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"full_name\":\"Alex Newcomer\",\"email\":\"alex@example.com\",\"password\":\"Pass123!\"}"

# Login
curl -X POST http://127.0.0.1:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"alex@example.com\",\"password\":\"Pass123!\"}"

# List housing
curl http://127.0.0.1:5000/api/listings/
```

## Roadmap Highlights

- ✅ Backend skeleton with SQLAlchemy models and REST endpoints.
- ✅ Automated tests (PyTest) for auth, listings, events.
- ✅ Deployable Angular client consuming the API (see `frontend/README.md`).
- 🔄 Improved survey + interview data to drive requirements.
- 🔄 Token-based authentication and admin moderation workflow.

Progress should be continuously documented in the Mid-Term Progress Report with explicit reflection on decisions, evidence, and course feedback.

Additional planning materials live in `docs/`:
- `evidence-log.md` – tie every feature to real observations.
- `interview-guide.md` – neutral script for upcoming interviews.
- `reflection-log.md` – capture learning after each iteration.

