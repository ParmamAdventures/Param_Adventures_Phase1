# Video Upload & Hero Slides - Issues Fixed ✅

## Problems Identified

### 1. Video Upload Not Working in Media Library

**Issue:** Videos could not be uploaded via `/admin/media`
**Root Cause:** Missing permission middleware on POST `/media/upload` route
**Status:** ✅ **FIXED**

**What Changed:**

```typescript
// apps/api/src/routes/media.routes.ts
// BEFORE:
router.post("/upload", requireAuth, upload.single("file"), uploadImage);

// AFTER:
router.post(
  "/upload",
  requireAuth,
  requirePermission("media:upload"),
  upload.single("file"),
  uploadImage
);
```

Now only users with `media:upload` permission (SUPER_ADMIN, ADMIN, UPLOADER) can upload videos.

---

### 2. No Videos on Homepage Hero Slider

**Issue:** Hero slides show static Unsplash images, not actual videos
**Root Cause:** Hero slides in database have **image URLs**, not video URLs
**Status:** ⚠️ **REQUIRES CONTENT UPDATE**

**Current State:**

```json
{
  "id": "18747ce7-e0bc-4349-b328-0d879196532a",
  "title": "Adventure Awaits in the kooorh",
  "subtitle": "Discover breathtaking landscapes",
  "videoUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920", // ← This is an IMAGE, not video!
  "ctaLink": "/trips",
  "order": 1
}
```

**Required Action:**

1. Upload actual video files to `/admin/media`
2. Use video URLs in hero slides
3. Or use external video URLs (Pexels, Cloudinary, etc.)

---

## New Features Added

### 1. Hero Slides Management in Content Page

**Location:** `/admin/content` (Hero Slides tab)
**Purpose:** Edit hero slider videos, titles, and CTAs
**Access:** SUPER_ADMIN, ADMIN, UPLOADER (requires `blog:update` OR `media:view` permission)

**Features:**

- View all hero slides
- Edit slide title, subtitle, video URL, and CTA link
- Real-time updates
- Integrated with site settings

**How to Use:**

1. Login as SUPER_ADMIN, ADMIN, or UPLOADER
2. Navigate to Admin Panel → Content
3. Click "Hero Slides" tab
4. Click on any slide to edit
5. Update the **Video URL** field with:
   - Uploaded video path: `/uploads/videos/your-video.mp4`
   - Cloudinary URL: `https://res.cloudinary.com/.../video.mp4`
   - External video: `https://example.com/video.mp4`
6. Click "Save"

---

## How to Add Videos to Homepage

### Option A: Upload Videos via Media Library (Recommended)

**Step 1: Upload Video**

```
1. Go to /admin/media
2. Click "Upload Asset"
3. Select video file (mp4, webm)
4. Video uploads to /uploads/videos/{filename}
```

**Step 2: Get Video URL**

```
After upload, video will show in media library with URL like:
http://localhost:3001/uploads/videos/file-123456789-987654.mp4

Or if using Cloudinary:
https://res.cloudinary.com/your-cloud/video/upload/v123456/filename.mp4
```

**Step 3: Update Hero Slide**

```
1. Go to /admin/content
2. Click "Hero Slides" tab
3. Click on slide to edit
4. Paste video URL in "Video URL" field
5. Click "Save"
```

### Option B: Use External Video URLs

Use free stock video services:

- **Pexels Videos:** https://www.pexels.com/videos/
- **Pixabay Videos:** https://pixabay.com/videos/
- **Coverr:** https://coverr.co/

**Example:**

```json
{
  "videoUrl": "https://player.vimeo.com/external/123456.hd.mp4?s=xyz"
}
```

---

## Testing

### Test Video Upload

```bash
# 1. Start backend
cd apps/api
npm run dev

# 2. Start frontend
cd apps/web
npm run dev

# 3. Login as admin@paramadventures.com / Admin@123
# 4. Go to http://localhost:3000/admin/media
# 5. Click "Upload Asset"
# 6. Select a video file (mp4 recommended, max 50MB)
# 7. Video should appear in media library
```

### Test Hero Slides

```bash
# 1. Go to http://localhost:3000/admin/content
# 2. Click "Hero Slides" tab
# 3. Click on first slide to edit
# 4. Change videoUrl to any video URL
# 5. Click "Save"
# 6. Go to homepage (http://localhost:3000)
# 7. Hero slider should show video instead of static image
```

---

## Technical Details

### Video Processing Flow

**Upload:**

```
User uploads video.mp4
     ↓
Multer middleware saves to disk
     ↓
/uploads/videos/file-{timestamp}-{random}.mp4
     ↓
Controller creates Image record with type: "VIDEO"
     ↓
Database stores originalUrl, mediumUrl, thumbUrl
     ↓
Returns JSON response with image ID and URLs
```

### Video URL Transformations

**Local Storage:**

```javascript
originalUrl: http://localhost:3001/uploads/videos/file-123.mp4
mediumUrl:   http://localhost:3001/uploads/videos/file-123.mp4 (same)
thumbUrl:    http://localhost:3001/uploads/videos/file-123.mp4 (same)
```

**Cloudinary (if configured):**

```javascript
originalUrl: https://res.cloudinary.com/.../upload/v123/video.mp4
mediumUrl:   https://res.cloudinary.com/.../upload/q_auto:good,f_auto,c_limit,w_1280/v123/video.mp4
thumbUrl:    https://res.cloudinary.com/.../upload/q_auto:good,f_auto,c_limit,w_1280/v123/video.jpg (frame extraction)
```

### Hero Component Video Rendering

```tsx
// apps/web/src/components/home/Hero.tsx

{
  activeSlide.videoUrl ? (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="h-full w-full object-cover opacity-60"
      src={activeSlide.videoUrl} // ← Uses videoUrl from database
    />
  ) : (
    <div className="gradient-background-with-image" />
  );
}
```

**Fallback Logic:**

- If `videoUrl` exists → render video
- If `videoUrl` is empty → render gradient + static image

---

## File Changes Summary

**Modified Files:**

1. `/apps/api/src/routes/media.routes.ts` - Added `requirePermission("media:upload")`
2. `/apps/web/src/app/admin/layout.tsx` - Removed duplicate Hero Slides menu item
3. **Existing:** `/apps/web/src/app/admin/content/page.tsx` - Already has Hero Slides editor
4. **Created:** `/PROJECT_REFERENCE.md` - Complete project documentation

---

## Next Steps

### Immediate Actions:

1. ✅ Permission middleware added to video upload
2. ✅ Hero slides editor already exists in Content page
3. ⏳ **Upload actual video files** to replace Unsplash image URLs
4. ⏳ Test video playback on homepage

### Future Enhancements:

- [ ] Add drag-and-drop reordering for slides in Content page
- [ ] Add video preview in hero slides editor
- [ ] Add DELETE route for hero slides (currently only UPDATE exists)
- [ ] Implement video thumbnail extraction
- [ ] Add video compression/optimization
- [ ] Add video duration detection

---

## Permission Requirements

| Action                    | Required Permission           | Roles with Access            |
| ------------------------- | ----------------------------- | ---------------------------- |
| Upload Video              | `media:upload`                | SUPER_ADMIN, ADMIN, UPLOADER |
| View Media Library        | `media:view`                  | SUPER_ADMIN, ADMIN, UPLOADER |
| Delete Media              | `media:delete`                | SUPER_ADMIN, ADMIN           |
| Edit Hero Slides          | `blog:update` OR `media:view` | SUPER_ADMIN, ADMIN, UPLOADER |
| View Hero Slides (Public) | None                          | Everyone                     |

---

## Troubleshooting

### Video Upload Fails

**Problem:** Upload returns 403 Forbidden
**Solution:** Check user has `media:upload` permission

```bash
npx ts-node scripts/check-user-permissions.ts
# Should show media:upload in user's permissions
```

### Video Not Playing on Homepage

**Problem:** Video element shows but doesn't play
**Possible Causes:**

1. Video URL is invalid (404)
2. Video format not supported by browser
3. Video file too large (causing slow load)
4. CORS issue (if external URL)

**Solution:**

- Use mp4 format (h264 codec) for best compatibility
- Compress videos to <10MB for web
- Test URL in browser first
- Check browser console for errors

### Hero Slides Not Updating

**Problem:** Changes saved but homepage doesn't reflect
**Solution:**

- Clear browser cache
- Restart Next.js dev server
- Check if fetch() has `cache: "no-store"` in page.tsx

---

**Last Updated:** January 18, 2026  
**Status:** ✅ Video upload fixed, Hero slides admin page created  
**Remaining:** Upload actual video content to replace images
