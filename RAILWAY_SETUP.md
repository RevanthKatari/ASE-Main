# Railway Setup Guide

## Current Status ✅

Your Railway deployment is set up with:
- ✅ Backend service deployed successfully
- ✅ PostgreSQL database connected
- ✅ `DATABASE_URL` automatically provided by Railway
- ✅ `FRONTEND_URL` set
- ✅ `SECRET_KEY` set

---

## Required Environment Variables

### In Your Backend Service (web)

Go to: **Railway → web service → Variables**

Make sure you have these variables:

1. **`FRONTEND_URL`** ✅ (Already set)
   - Your Vercel frontend URL
   - Example: `https://your-app.vercel.app`

2. **`SECRET_KEY`** ✅ (Already set)
   - Random secret key for Flask sessions

3. **`DATABASE_URL`** ✅ (Auto-set by Railway)
   - Automatically provided when PostgreSQL is linked
   - **Don't manually set this** - Railway handles it

4. **`BACKEND_URL`** ⚠️ (Needs to be set)
   - **Key**: `BACKEND_URL`
   - **Value**: `https://web-production-dd64f.up.railway.app`
   - **Why**: Needed for image URLs to work correctly
   - **How to add**:
     1. Go to Railway → web service → Variables
     2. Click "New Variable"
     3. Key: `BACKEND_URL`
     4. Value: `https://web-production-dd64f.up.railway.app`
     5. Click "Add"
     6. Railway will auto-redeploy

---

## Database Connection

### Using Private Endpoint (Recommended - No Egress Fees)

Railway automatically provides `DATABASE_URL` which uses the private endpoint. This is:
- ✅ Free (no egress fees)
- ✅ Faster (internal network)
- ✅ More secure

**Your backend is already using this** - no action needed!

### Public Endpoint (Only if needed)

`DATABASE_PUBLIC_URL` is available but:
- ⚠️ Incurs egress fees
- ⚠️ Slower (goes through internet)
- Only use if you need external access

**For your app, use `DATABASE_URL` (private) - which Railway already provides!**

---

## Verification Checklist

After setting `BACKEND_URL`, verify:

1. **Backend is running**:
   - Check Railway logs for: `✅ Seed data created successfully`
   - Test: `https://web-production-dd64f.up.railway.app/health`
   - Should return: `{"status":"ok"}`

2. **Database is connected**:
   - Check Railway logs - no database connection errors
   - Test API: `https://web-production-dd64f.up.railway.app/api/listings/`
   - Should return JSON (even if empty: `[]`)

3. **Helper account exists**:
   - Email: `helper@windsorhub.ca`
   - Password: `Password123!`
   - Try logging in on your frontend

4. **Images work**:
   - Seed data includes sample listings with images
   - They should display correctly after `BACKEND_URL` is set

---

## Troubleshooting

### Database Connection Issues

If you see database errors:
1. Check that PostgreSQL service is running (green status)
2. Verify `DATABASE_URL` is set (Railway auto-sets this)
3. Check Railway logs for specific error messages

### Images Not Loading

1. **Set `BACKEND_URL`** in Railway variables (see above)
2. Wait for Railway to redeploy
3. Clear browser cache
4. Check browser console for image errors

### Can't Login to Helper Account

1. Check Railway logs for seed data message
2. If you see "Seed data already exists", the account should work
3. If not, the seed will run on next deployment
4. Try: `helper@windsorhub.ca` / `Password123!`

---

## Next Steps

1. ✅ Set `BACKEND_URL` in Railway (see above)
2. ✅ Wait for Railway to redeploy (~1-2 minutes)
3. ✅ Test your frontend - images should load
4. ✅ Try logging in with helper account
5. ✅ Create a new account - data should persist

---

## Summary

Your setup is almost complete! Just need to:
- Add `BACKEND_URL` environment variable
- Wait for redeploy
- Test the application

Everything else is configured correctly! 🎉

