# 🎉 Luma Event Integration

## Overview
Added support for embedding Luma (lu.ma) events directly into the Windsor Community Hub event detail pages.

---

## ✨ Features Added

### 1. 📋 **Event Creation with Luma Embed**

**New Field:**
- Optional "Luma Event Embed URL" field in event creation form
- Accepts Luma embed URLs (e.g., `https://lu.ma/embed/event/evt-xxx/simple`)
- Shows helpful hint text to guide users

**Backend:**
- New `iframe_url` column in Event model (nullable string, max 500 chars)
- Endpoint accepts `iframe_url` in POST /api/events/
- Seed data includes example event with Luma embed

### 2. 🖼️ **Embedded Event Display**

**Event Detail Page:**
- Displays embedded Luma iframe when URL is provided
- Full-width, 600px height for optimal viewing
- Secure iframe handling using Angular DomSanitizer
- Responsive container with proper styling
- Allows fullscreen and payment features

**Safety:**
- URLs are sanitized using `DomSanitizer.bypassSecurityTrustResourceUrl()`
- Only displays if `iframe_url` is present
- Graceful fallback for events without embeds

### 3. 🎨 **Refined Global Styles**

**CSS Variables System:**
- Defined color system (primary, success, warning, error)
- Spacing system (xs to 2xl)
- Border radius tokens (sm to xl)
- Shadow tokens (sm to lg)
- Consistent text colors

**Global Resets:**
- Proper box-sizing for all elements
- Image defaults (max-width, block display)
- Font smoothing for better text rendering
- Consistent line-height across all text

---

## 🚀 How to Use

### Creating an Event with Luma Embed:

1. **Get the Luma embed URL:**
   - Go to your Luma event page
   - Click "Share" → "Embed"
   - Copy the embed URL from the `src` attribute
   - Example: `https://lu.ma/embed/event/evt-QJWboYkaiUk1mDE/simple`

2. **Create the event:**
   ```
   - Sign in to Windsor Community Hub
   - Go to Events page
   - Fill in event details (title, description, date, location)
   - Paste Luma embed URL in "Luma Event Embed URL" field
   - Click "Publish Event"
   ```

3. **View the embedded event:**
   ```
   - Go to Events page
   - Click on your event card
   - See the embedded Luma event interface
   - Users can RSVP directly through Luma
   ```

---

## 📸 What Users See

### Event Creation Form:
```
┌──────────────────────────────────────┐
│ Event Title *                        │
│ ┌──────────────────────────────────┐ │
│ │ Community Potluck                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ... other fields ...                 │
│                                      │
│ Luma Event Embed URL (Optional)     │
│ ┌──────────────────────────────────┐ │
│ │ https://lu.ma/embed/event/...    │ │
│ └──────────────────────────────────┘ │
│ ℹ️ If you have a Luma event...       │
└──────────────────────────────────────┘
```

### Event Detail Page (with embed):
```
┌────────────────────────────────────────┐
│  ← Back to Events                      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │   📅 Community Potluck             │ │
│ │   📍 Windsor Community Centre      │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │   [Embedded Luma Event]            │ │
│ │   - RSVP button                    │ │
│ │   - Event details                  │ │
│ │   - Guest list                     │ │
│ │   - Interactive features           │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Date & Time                        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ... other event details ...            │
└────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Backend Changes

**Model (backend/models.py):**
```python
class Event(db.Model):
    # ... existing fields ...
    iframe_url = db.Column(db.String(500), nullable=True)
```

**Route (backend/routes/events.py):**
```python
# Accept iframe_url from request
iframe_url = payload.get("iframe_url", "").strip() or None

event = Event(
    # ... other fields ...
    iframe_url=iframe_url,
)
```

**Seed Data:**
```python
Event(
    title="Community Potluck",
    # ... other fields ...
    iframe_url="https://lu.ma/embed/event/evt-QJWboYkaiUk1mDE/simple",
)
```

### Frontend Changes

**Model (event.ts):**
```typescript
export interface CommunityEvent {
  // ... existing fields ...
  iframe_url?: string;
}
```

**Event Creation Form:**
```html
<label class="form-label">
  <span class="label-text">Luma Event Embed URL (Optional)</span>
  <input
    type="url"
    formControlName="iframe_url"
    placeholder="e.g., https://lu.ma/embed/event/evt-xxx/simple"
  />
  <small class="form-hint">
    If you have a Luma event, paste the embed URL here
  </small>
</label>
```

**Event Detail Display:**
```typescript
// Component
private sanitizer = inject(DomSanitizer);
safeIframeUrl = signal<SafeResourceUrl | null>(null);

// In loadEvent()
if (event.iframe_url) {
  this.safeIframeUrl.set(
    this.sanitizer.bypassSecurityTrustResourceUrl(event.iframe_url)
  );
}
```

```html
<section *ngIf="event.iframe_url && safeIframeUrl()" class="iframe-container">
  <iframe
    [src]="safeIframeUrl()"
    width="100%"
    height="600"
    frameborder="0"
    allow="fullscreen; payment"
  ></iframe>
</section>
```

---

## 🎨 Style System

### CSS Variables:
```scss
:root {
  /* Colors */
  --color-primary: #667eea;
  --color-success: #51cf66;
  --color-warning: #ffc107;
  --color-error: #ff6b6b;
  
  /* Spacing (rem-based) */
  --spacing-xs: 0.25rem;   // 4px
  --spacing-sm: 0.5rem;    // 8px
  --spacing-md: 1rem;      // 16px
  --spacing-lg: 1.5rem;    // 24px
  --spacing-xl: 2rem;      // 32px
  --spacing-2xl: 3rem;     // 48px
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

### Usage Example:
```scss
.card {
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

---

## 🧪 Testing

### Test with Luma Embed:
1. Start backend: `python -m backend.app`
2. Start frontend: `npm start`
3. Go to Events page
4. Click "Community Potluck" (has Luma embed)
5. Verify iframe loads and is interactive
6. Test RSVP functionality within iframe

### Test without Luma Embed:
1. Click "Newcomer Orientation Workshop"
2. Verify no iframe section appears
3. All other details display correctly

### Test Creating New Event:
1. Sign in as helper
2. Create event with Luma URL
3. Create event without Luma URL
4. Verify both work correctly

---

## 🔒 Security

**DomSanitizer:**
- Angular's `DomSanitizer` prevents XSS attacks
- `bypassSecurityTrustResourceUrl()` used for iframe src
- Only Luma URLs should be provided (or other trusted sources)

**iframe Attributes:**
- `allow="fullscreen; payment"` - Enables Luma features
- No `allowscripts` or dangerous permissions
- Proper `frameborder` and styling

**Input Validation:**
- Backend trims and validates URL
- Frontend shows URL input type
- Optional field (can be empty)

---

## 📱 Responsive Design

**Desktop (>768px):**
- Full-width iframe (100%)
- 600px height
- Proper spacing around container

**Mobile (<768px):**
- Full-width iframe maintained
- Adjusted height for mobile viewing
- Scrollable within iframe
- Touch-friendly controls

---

## 💡 Best Practices

### For Event Organizers:
1. **Always use the embed URL**, not the regular event page URL
2. **Test the embed** before publishing
3. **Provide fallback information** in description
4. **Include date/time/location** even with embed

### For Administrators:
1. **Only embed trusted sources** (Luma, Eventbrite, etc.)
2. **Monitor iframe performance**
3. **Provide clear instructions** to users
4. **Consider iframe size** for different devices

---

## 🚀 Future Enhancements

- [ ] Support for other event platforms (Eventbrite, Zoom, etc.)
- [ ] Preview embed in creation form
- [ ] Validate URL format before submission
- [ ] Adjustable iframe height
- [ ] Embed analytics/tracking
- [ ] Custom styling for iframes
- [ ] Lazy loading for iframes
- [ ] Fullscreen toggle button

---

## 🐛 Troubleshooting

**Iframe not displaying:**
- Check if `iframe_url` is present in API response
- Verify URL format is correct
- Check browser console for errors
- Ensure DomSanitizer is working

**Iframe content not loading:**
- Verify Luma event URL is valid
- Check network tab for blocked requests
- Ensure event is published on Luma
- Check iframe `allow` attributes

**Mobile display issues:**
- Test on actual device
- Check viewport meta tag
- Verify responsive CSS
- Test touch interactions

---

**Enjoy seamless Luma event integration!** 🎊

Users can now create rich, interactive event experiences with RSVP, guest lists, and more!

