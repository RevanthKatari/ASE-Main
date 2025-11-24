# Frontend Deployment Guide

This guide will help you deploy the Windsor Community Hub frontend to Vercel or Netlify.

## Prerequisites

✅ Backend is deployed on Railway: `https://web-production-dd64f.up.railway.app`
✅ Frontend environment file updated with backend URL
✅ Code pushed to GitHub

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Sign up/Login
1. Go to [vercel.com](https://vercel.com)
2. Sign up or login with your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Select your repository (`ASE-Main`)
4. Click **"Import"**

### Step 3: Configure Project
1. **Framework Preset**: Select **"Angular"** (Vercel should auto-detect)
2. **Root Directory**: Click "Edit" and set to: `frontend/windsor-community-hub`
3. **Build Command**: Leave as default or set to: `npm run build`
4. **Output Directory**: 
   - For Angular 17+: `dist/windsor-community-hub/browser`
   - Or try: `dist/windsor-community-hub`
5. **Install Command**: Leave as default (`npm install`)

### Step 4: Environment Variables (Optional)
If you need to override the API URL:
- **Key**: `API_URL`
- **Value**: `https://web-production-dd64f.up.railway.app/api`

(Not needed if you've already updated `environment.ts`)

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)

### Step 6: Update CORS in Railway
1. Go to Railway → Your backend service → **Variables**
2. Add/update `FRONTEND_URL`:
   - **Value**: Your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Railway will auto-redeploy

---

## Option 2: Deploy to Netlify

### Step 1: Sign up/Login
1. Go to [netlify.com](https://netlify.com)
2. Sign up or login with your GitHub account

### Step 2: Create New Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to **GitHub**
3. Select your repository (`ASE-Main`)

### Step 3: Configure Build Settings
1. **Base directory**: `frontend/windsor-community-hub`
2. **Build command**: `npm install && npm run build`
3. **Publish directory**: 
   - For Angular 17+: `dist/windsor-community-hub/browser`
   - Or try: `dist/windsor-community-hub`

### Step 4: Deploy
1. Click **"Deploy site"**
2. Wait for build to complete
3. Netlify will provide a URL (e.g., `https://your-app.netlify.app`)

### Step 5: Update CORS in Railway
1. Go to Railway → Your backend service → **Variables**
2. Add/update `FRONTEND_URL`:
   - **Value**: Your Netlify URL (e.g., `https://your-app.netlify.app`)
3. Railway will auto-redeploy

---

## Option 3: Deploy to Railway (If Available)

Railway doesn't have native static site hosting, but you can:
1. Build the Angular app locally
2. Serve it as static files from your Flask backend
3. Or use Railway's newer static site feature if available

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel/Netlify dashboard
- Ensure Node.js version is compatible (Angular 17 needs Node 18+)
- Verify all dependencies are in `package.json`

### CORS Errors
- Verify `FRONTEND_URL` in Railway matches your frontend domain exactly
- Check that backend has been redeployed after updating `FRONTEND_URL`
- Ensure no trailing slashes in URLs

### API Calls Fail
- Check browser console for errors
- Verify `apiBaseUrl` in `environment.ts` is correct
- Test backend API directly: `https://web-production-dd64f.up.railway.app/api/listings/`

### Routing Issues (404 on refresh)
- **Vercel**: Create `vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

- **Netlify**: Create `netlify.toml` in `frontend/windsor-community-hub/`:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

---

## Quick Checklist

- [x] Backend deployed on Railway
- [x] Frontend environment.ts updated with Railway URL
- [x] Code pushed to GitHub
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Copy frontend URL
- [ ] Update `FRONTEND_URL` in Railway
- [ ] Test full application

---

## Recommended: Vercel

Vercel is recommended because:
- ✅ Excellent Angular support
- ✅ Automatic deployments on git push
- ✅ Free SSL and CDN
- ✅ Fast global performance
- ✅ Easy configuration

Your frontend is ready to deploy! The environment file has been updated with your Railway backend URL.

