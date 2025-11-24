# Render Deployment Guide

This guide will help you deploy the Windsor Community Hub to Render.com.

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Render.com account (sign up at https://render.com)

## Step 1: Deploy Backend (Flask API)

### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `windsor-hub-api` (or your choice)
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.app:app`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   - `PORT` = `5000` (Render sets this automatically, but good to have)
   - `SECRET_KEY` = Generate using: `python -c "import secrets; print(secrets.token_hex(32))"`
   - `FRONTEND_URL` = Leave empty for now (set after frontend deploys)
   - `DATABASE_URL` = (See note below about database options)

6. **Important - Database Storage**:
   - **Free Tier Limitation**: Render's free tier uses ephemeral filesystem - SQLite data will be lost on restarts
   - **Option 1 (Recommended)**: Use Render's free PostgreSQL database (see "Database Setup" section below)
   - **Option 2**: Use SQLite for testing (data won't persist, but works for demos)
   - **Option 3**: Upgrade to paid plan for persistent disks

7. Click **"Create Web Service"**
8. Wait for deployment to complete
9. **Copy your backend URL** (e.g., `https://windsor-hub-api.onrender.com`)

### Option B: Using render.yaml (Recommended)

1. Push your code to GitHub (render.yaml is already configured)
2. Go to Render Dashboard
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and create both services
6. Update environment variables as needed

## Database Setup (Important!)

### Option 1: PostgreSQL (Recommended for Production)

Render offers a **free PostgreSQL database** that persists data:

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `windsor-hub-db`
   - **Database**: `windsor_hub`
   - **User**: Auto-generated
   - **Region**: Same as your backend
   - **Plan**: Free
3. Click **"Create Database"**
4. Copy the **Internal Database URL** (starts with `postgresql://`)
5. Go to your backend service → **Environment** tab
6. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL URL
7. **Update your backend code** to use PostgreSQL instead of SQLite (see below)

### Option 2: SQLite (Testing Only)

- SQLite will work but **data will be lost** on service restarts/redeploys
- Only suitable for testing/demos
- No additional setup needed (uses default SQLite)

### Updating Backend for PostgreSQL

If using PostgreSQL, you'll need to update `backend/config.py`:

```python
SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}",  # Fallback to SQLite
)
```

The code already supports this! Just set the `DATABASE_URL` environment variable.

## Step 2: Deploy Frontend (Angular)

1. **Update Environment File**:
   - Edit `frontend/windsor-community-hub/src/environments/environment.ts`
   - Replace `your-backend-name.onrender.com` with your actual backend URL
   - Example: `apiBaseUrl: 'https://windsor-hub-api.onrender.com/api'`

2. **Commit and push the change**:
   ```bash
   git add frontend/windsor-community-hub/src/environments/environment.ts
   git commit -m "Update API URL for production"
   git push origin main
   ```

3. **Create Static Site on Render**:
   - Click **"New +"** → **"Static Site"**
   - Connect your GitHub repository
   - **Name**: `windsor-hub-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend/windsor-community-hub && npm install && npm run build`
   - **Publish Directory**: `frontend/windsor-community-hub/dist/windsor-community-hub`

4. Click **"Create Static Site"**
5. Wait for deployment
6. **Copy your frontend URL** (e.g., `https://windsor-hub-frontend.onrender.com`)

## Step 3: Update CORS Settings

1. Go back to your **backend service** on Render
2. Navigate to **"Environment"** tab
3. Update `FRONTEND_URL` environment variable:
   - Set it to your frontend URL (e.g., `https://windsor-hub-frontend.onrender.com`)
4. **Save changes** (this will trigger a redeploy)

## Step 4: Test Your Deployment

1. Visit your frontend URL
2. Test the following:
   - User registration/login
   - Creating a listing
   - Creating an event
   - Viewing listings and events
   - Photo uploads (if implemented)

## Important Notes

### Free Tier Limitations

- **Spin-down**: Services spin down after 15 minutes of inactivity
- **Cold start**: First request after spin-down takes ~30-50 seconds
- **Monthly hours**: 750 hours/month (enough for 24/7 on one service)

### Database Persistence

- **Free Tier**: SQLite data is **NOT persistent** - will be lost on restarts
- **Recommended**: Use Render's free PostgreSQL database for data persistence
- **Alternative**: Upgrade to paid plan for persistent disk storage

### File Uploads

- Uploaded photos are stored in `backend/uploads/`
- This directory should persist with the disk mount
- For production, consider cloud storage (Cloudinary, Supabase Storage)

### Environment Variables

Never commit secrets to your repository. Always use Render's environment variables:
- `SECRET_KEY` - Flask secret key
- `FRONTEND_URL` - Your frontend domain for CORS
- `DATABASE_URL` - (Optional) If using PostgreSQL

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `requirements.txt`
- Verify Node.js version compatibility for frontend

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Check that backend has been redeployed after updating `FRONTEND_URL`
- Ensure no trailing slashes in URLs

### Database Not Persisting
- **Free Tier Limitation**: SQLite data is ephemeral on free tier
- **Solution**: Use Render PostgreSQL database (free tier available)
- If using PostgreSQL, verify `DATABASE_URL` environment variable is set correctly

### 502 Bad Gateway
- Service might be spinning up (normal on free tier)
- Wait 30-50 seconds and try again
- Check service logs for errors

### Photo Uploads Not Working
- Verify `uploads/` directory exists
- Check file permissions
- Consider using cloud storage for production

## Next Steps

1. **Set up custom domain** (optional):
   - Go to your service settings
   - Add custom domain
   - Update DNS records

2. **Enable auto-deploy** (already enabled by default):
   - Services auto-deploy on git push
   - Can be configured in service settings

3. **Set up monitoring**:
   - Render provides basic logs
   - Consider adding error tracking (Sentry, etc.)

4. **Upgrade considerations**:
   - **PostgreSQL** (free tier available) - Required for data persistence on free tier
   - **Cloud storage** for file uploads (Cloudinary, Supabase Storage)
   - **Paid tier** to avoid spin-down delays and get persistent disks

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Project Issues: Check your repository's issue tracker

