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

6. **Add Persistent Disk** (for SQLite database):
   - Go to **"Disks"** tab
   - Click **"Add Disk"**
   - **Name**: `instance`
   - **Mount Path**: `/opt/render/project/src/backend/instance`
   - **Size**: 1 GB

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

- SQLite database is stored on the persistent disk
- Data persists across deployments
- For production, consider upgrading to Render PostgreSQL (free tier available)

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
- Verify disk is mounted correctly
- Check disk mount path matches configuration
- Ensure `instance/` directory exists

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
   - PostgreSQL for better database performance
   - Cloud storage for file uploads
   - Paid tier to avoid spin-down delays

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Project Issues: Check your repository's issue tracker

