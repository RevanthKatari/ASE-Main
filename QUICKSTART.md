# 🚀 Quick Start Guide - UniLife

## What's New?

🎨 **Brand New UI** - Modern, professional design across all pages  
📷 **Photo Uploads** - Add images to housing listings  
🛡️ **Moderation Dashboard** - Helpers can verify student listings  
✅ **Verification System** - Clear trust indicators

---

## Getting Started (5 Minutes)

### Step 1: Reseed the Database
```powershell
# From project root
.venv\Scripts\activate
python -m backend.seed_data
```

### Step 2: Start the Backend
```powershell
python -m backend.app
```
✅ API running at `http://localhost:5000`

### Step 3: Start the Frontend
```powershell
cd frontend/windsor-community-hub
npm start
```
✅ App running at `http://localhost:4200`

---

## 🎭 Try These Workflows

### As a Student (Regular User)
1. **Sign in:** `student@unilife.ca` / `Password123!`
2. **Go to Housing** → Click "Share a Housing Opportunity"
3. **Upload photos:**
   - Click "📷 Add Photo"
   - Select an image
   - See preview appear
4. **Submit listing** (will appear as unverified)

### As a Helper (Moderator)
1. **Sign in:** `helper@unilife.ca` / `Password123!`
2. **Click "Moderation"** in the navigation bar
3. **Review pending listings:**
   - See student's listing from above
   - View photos and details
   - Click "✅ Verify Listing"
4. **Verified!** Listing moves to verified section

### View the Results
1. **Sign out** and view as guest
2. **Go to Housing**
3. **See both listings:**
   - Helper's listing (auto-verified, green border)
   - Student's listing (now verified, green border)
   - Both show photos

---

## 🎨 New Features to Explore

### Photo Uploads
- **Max file size:** 16MB
- **Formats:** PNG, JPG, JPEG, GIF, WEBP
- **Preview:** See photos before publishing
- **Remove:** Click ✕ to remove unwanted photos

### Moderation Dashboard
- **Access:** Only visible to helpers (non-students)
- **URL:** `http://localhost:4200/moderation`
- **Features:**
  - Pending vs Verified split view
  - Count badges
  - Photo previews
  - One-click approval

### Modern UI
- **Gradient branding** throughout
- **User avatar** with initials
- **Role badges** in navigation
- **Smooth animations** on hover
- **Responsive** on all screen sizes
- **Emoji icons** for visual context

---

## 📸 Screenshot Tour

### Navigation Bar
- User avatar with initials
- Role display (helper/student)
- Moderation link (helpers only)
- Modern gradient design

### Housing Listings
- Photo showcase with hover effects
- Verified badge overlays
- Modern card design
- Price with /mo suffix

### Moderation Dashboard
- Split view: pending vs verified
- Color-coded borders
- Photo previews
- Approval workflow

### Create Listing Form
- Photo upload section
- Preview grid
- Modern form fields
- Gradient submit button

---

## 🔧 API Endpoints (New)

### Photo Upload
```
POST /api/listings/upload-photo
Content-Type: multipart/form-data

Body: photo (file)

Response: { "url": "/uploads/20251119_155000_image.jpg" }
```

### Verify Listing
```
PATCH /api/listings/<id>/verify
Content-Type: application/json

Body: { "helper_id": 1 }

Response: <Updated Listing Object>
```

---

## 💡 Pro Tips

1. **Upload multiple photos** - Upload several times, they stack up
2. **Preview before submit** - Remove unwanted photos with ✕
3. **Moderation workflow** - Helpers see real-time count of pending items
4. **Photo URLs** - Stored at `http://localhost:5000/uploads/<filename>`
5. **Role switching** - Sign out and in with different accounts to test both workflows

---

## 🎯 Test Scenarios

### Scenario 1: Full Photo Upload Workflow
1. Sign in as student
2. Create listing with 2-3 photos
3. Submit
4. Sign in as helper
5. Go to moderation
6. See photos, verify
7. Check listings page - photos visible

### Scenario 2: Mobile Experience
1. Open browser DevTools
2. Toggle device toolbar (responsive mode)
3. Try iPhone/Android viewport
4. Navigation collapses nicely
5. Cards stack vertically
6. Forms remain usable

### Scenario 3: Empty States
1. Browse as guest
2. See "sign in to create" prompts
3. Try moderation as student
4. See "need helper privileges" message

---

## 🐛 Troubleshooting

**Photos not uploading?**
- Check backend is running
- Verify `backend/uploads/` directory exists
- Check browser console for errors

**Moderation link not showing?**
- Sign in as helper, not student
- Check user role in navbar

**Styles look broken?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check frontend terminal for build errors

---

## 📚 Next Steps

1. **Read CHANGES.md** for technical details
2. **Update evidence log** with user feedback
3. **Test on different browsers**
4. **Gather newcomer feedback** on photo feature
5. **Document helper workflow** in research notes

---

**Ready to explore? Sign in and start creating!** 🚀

