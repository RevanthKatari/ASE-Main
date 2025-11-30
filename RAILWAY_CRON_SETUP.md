# Railway Cron Job Setup for CS Events Scraper

Since APScheduler doesn't work well with Railway's gunicorn workers, we'll use Railway's built-in cron jobs instead.

## Option 1: Railway Cron Jobs (Recommended)

Railway supports cron jobs through their platform. Here's how to set it up:

### Step 1: Create a Cron Service in Railway

1. Go to your Railway project dashboard
2. Click **"New"** → **"Cron Job"**
3. Configure:
   - **Name**: `cs-events-scraper`
   - **Schedule**: `0 2 * * *` (runs daily at 2:00 AM UTC)
   - **Command**: `curl -X POST https://your-backend-url.railway.app/api/cs-events/scrape`
   - **Service**: Select your backend web service

### Step 2: Add Authentication (Optional but Recommended)

To prevent unauthorized scraping, you can add a simple API key:

1. In your backend service, add environment variable:
   - `CS_SCRAPE_API_KEY` = (generate a random key)

2. Update the cron command to include the key:
   ```
   curl -X POST -H "X-API-Key: your-api-key-here" https://your-backend-url.railway.app/api/cs-events/scrape
   ```

3. Update `backend/routes/cs_events.py` to check for the key:
   ```python
   @cs_events_bp.post("/scrape")
   def scrape_cs_events():
       api_key = request.headers.get('X-API-Key')
       expected_key = os.getenv('CS_SCRAPE_API_KEY')
       if expected_key and api_key != expected_key:
           return jsonify({"error": "Unauthorized"}), HTTPStatus.UNAUTHORIZED
       # ... rest of scraping code
   ```

## Option 2: External Cron Service (Alternative)

If Railway cron jobs aren't available, use an external service like:

- **cron-job.org** (free)
- **EasyCron** (free tier available)
- **GitHub Actions** (if your repo is on GitHub)

### Example: cron-job.org Setup

1. Sign up at https://cron-job.org
2. Create a new cron job:
   - **URL**: `https://your-backend-url.railway.app/api/cs-events/scrape`
   - **Method**: POST
   - **Schedule**: Daily at 2:00 AM
   - **Headers**: Add `X-API-Key: your-key` if using authentication

## Option 3: Manual Trigger via API

You can also manually trigger scraping by calling:
```bash
curl -X POST https://your-backend-url.railway.app/api/cs-events/scrape
```

Or use the "Refresh Events" button in the frontend UI.

## Environment Variables

Make sure these are set in your Railway backend service:

- `ENABLE_SCHEDULER=false` (keep scheduler disabled in production)
- `MAX_EVENT_DETAIL_FETCHES=15` (optional, limits detail fetches to avoid timeouts)
- `CS_SCRAPE_API_KEY` (optional, for authentication)

## Troubleshooting

If scraping fails:

1. Check Railway logs for errors
2. Verify the scraper endpoint is accessible: `GET /api/cs-events/`
3. Test manually: `POST /api/cs-events/scrape`
4. Check if the UWindsor website is accessible from Railway's network
5. Reduce `MAX_EVENT_DETAIL_FETCHES` if timeouts occur



