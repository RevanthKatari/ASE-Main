# Troubleshooting Guide

## Issue: "Unable to load housing listings"

This error typically indicates that the frontend cannot connect to the backend API. Here's how to fix it:

### Step 1: Verify Railway Backend is Running

1. Go to your Railway dashboard
2. Check that your backend service is **Active** (green status)
3. Test the API directly:
   - Open: `https://web-production-dd64f.up.railway.app/api/listings/`
   - You should see JSON data (even if empty: `[]`)
   - If you see an error, the backend isn't working

### Step 2: Check CORS Configuration in Railway

1. Go to Railway → Your backend service → **Variables**
2. Verify `FRONTEND_URL` is set to your **exact Vercel URL**:
   - Example: `https://ase-4c7972m0h-2339revanthgmailcoms-projects.vercel.app`
   - **Important**: 
     - No trailing slash
     - Must match exactly (including `https://`)
     - Case-sensitive
3. If you updated it, Railway will auto-redeploy (wait 1-2 minutes)

### Step 3: Check Browser Console

1. Open your Vercel frontend in a browser
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Look for errors like:
   - `CORS policy: No 'Access-Control-Allow-Origin' header`
   - `Failed to fetch`
   - `Network error`

### Step 4: Verify Environment Variables

**In Railway**, make sure you have:
- `FRONTEND_URL` = Your Vercel URL (e.g., `https://your-app.vercel.app`)
- `SECRET_KEY` = A random secret key
- `DATABASE_URL` = (Auto-set by Railway if using PostgreSQL)

**In Vercel**, the frontend should use:
- The `environment.ts` file already has: `apiBaseUrl: 'https://web-production-dd64f.up.railway.app/api'`

### Step 5: Test API Endpoints Directly

Test these URLs in your browser:

1. **Health Check**: `https://web-production-dd64f.up.railway.app/health`
   - Should return: `{"status":"ok"}`

2. **Listings API**: `https://web-production-dd64f.up.railway.app/api/listings/`
   - Should return: `[]` (empty array) or a list of listings

3. **If you get 404**: The routes aren't registered properly
4. **If you get 500**: There's a server error (check Railway logs)

### Step 6: Check Railway Logs

1. Go to Railway → Your backend service → **Deployments** → **Latest**
2. Click **View Logs**
3. Look for:
   - CORS errors
   - Database connection errors
   - Import errors
   - Any red error messages

### Step 7: Common Issues & Fixes

#### Issue: CORS Error
**Symptom**: Browser console shows `CORS policy` error

**Fix**:
1. Double-check `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. No trailing slash
3. Wait for Railway to redeploy after changing variables

#### Issue: 404 Not Found
**Symptom**: API returns 404

**Fix**:
- Check that routes are registered in `backend/routes/__init__.py`
- Verify the URL prefix is `/api/listings` (not just `/listings`)

#### Issue: Database Error
**Symptom**: 500 error, logs show database issues

**Fix**:
- Check Railway logs for specific error
- Verify database tables are created (should auto-create on startup)
- Check `DATABASE_URL` is set in Railway

#### Issue: Module Not Found
**Symptom**: Build fails or runtime error about missing modules

**Fix**:
- Check `backend/requirements.txt` has all dependencies
- Railway should install them automatically
- Check Railway build logs

### Step 8: Quick Test

Run this in your browser console on your Vercel site:

```javascript
fetch('https://web-production-dd64f.up.railway.app/api/listings/')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

- **Success**: You'll see the listings data
- **CORS Error**: `FRONTEND_URL` is wrong or backend hasn't redeployed
- **404**: Routes aren't working
- **Network Error**: Backend is down

---

## Quick Checklist

- [ ] Railway backend is **Active** (green)
- [ ] `FRONTEND_URL` in Railway = Your exact Vercel URL (no trailing slash)
- [ ] Tested API directly: `https://web-production-dd64f.up.railway.app/api/listings/`
- [ ] Checked browser console for errors
- [ ] Checked Railway logs for errors
- [ ] Waited for Railway to redeploy after variable changes

---

## Still Not Working?

1. **Share the exact error** from browser console
2. **Share Railway logs** (last 50 lines)
3. **Share your Vercel URL** so we can verify CORS
4. **Test the API directly** and share the response

The most common issue is `FRONTEND_URL` not matching exactly or Railway not redeploying after variable changes.

