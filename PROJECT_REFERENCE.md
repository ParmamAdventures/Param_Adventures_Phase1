# Param Adventures - Project Reference Guide

**Complete guide to understanding roles, permissions, and the trip/video workflow.**

---

## 1. ROLE STRUCTURE & PERMISSIONS

### 6 System Roles

| Role             | Access Level          | Primary Function                                  |
| ---------------- | --------------------- | ------------------------------------------------- |
| **SUPER_ADMIN**  | Full System Control   | Infrastructure, roles, all content approval       |
| **ADMIN**        | Operations Control    | Trip management, user management, bookings        |
| **TRIP_MANAGER** | Logistics Coordinator | Assign guides, manage bookings, view trip details |
| **TRIP_GUIDE**   | Field Staff           | View assigned trips, update status, see guests    |
| **UPLOADER**     | Content Creator       | Create trips, upload media, submit for review     |
| **USER**         | End Consumer          | Book trips, create blogs, view profile            |

---

## 2. PERMISSION MATRIX

### Trip Management

```
trip:create          - Create new trip drafts        [SUPER_ADMIN, ADMIN, UPLOADER]
trip:edit            - Edit trip details             [SUPER_ADMIN, ADMIN, UPLOADER]
trip:view:internal   - View draft/pending trips      [SUPER_ADMIN, ADMIN, UPLOADER, TRIP_MANAGER]
trip:submit          - Submit trip for review        [SUPER_ADMIN, ADMIN, UPLOADER]
trip:approve         - Approve trip for publishing   [SUPER_ADMIN, ADMIN]
trip:publish         - Publish trip live             [SUPER_ADMIN, ADMIN]
trip:archive         - Archive trip                  [SUPER_ADMIN, ADMIN]
trip:assign-guide    - Assign guides to trips        [SUPER_ADMIN, ADMIN, TRIP_MANAGER]
trip:assign-manager  - Assign managers to trips      [SUPER_ADMIN, ADMIN]
trip:update-status   - Update trip operational status[SUPER_ADMIN, ADMIN, TRIP_MANAGER, TRIP_GUIDE]
```

### Media Management

```
media:upload         - Upload images/videos          [SUPER_ADMIN, ADMIN, UPLOADER]
media:view           - View media library            [SUPER_ADMIN, ADMIN, UPLOADER]
media:delete         - Delete media                  [SUPER_ADMIN, ADMIN]
media:manage         - Manage media settings         [SUPER_ADMIN, ADMIN]
```

### Blog Management

```
blog:create          - Create draft blog             [SUPER_ADMIN, ADMIN, UPLOADER, USER]
blog:update          - Edit blog                     [SUPER_ADMIN, ADMIN, UPLOADER, USER]
blog:submit          - Submit for review             [SUPER_ADMIN, ADMIN, UPLOADER, USER]
blog:approve         - Approve blog                  [SUPER_ADMIN, ADMIN]
blog:reject          - Reject blog                   [SUPER_ADMIN, ADMIN]
blog:publish         - Publish blog                  [SUPER_ADMIN, ADMIN]
blog:view:internal   - View draft/pending blogs      [SUPER_ADMIN, ADMIN]
```

### Booking Management

```
booking:create       - Book a trip                   [SUPER_ADMIN, ADMIN, USER]
booking:read:admin   - View all bookings             [SUPER_ADMIN, ADMIN, TRIP_MANAGER]
booking:approve      - Manually approve              [SUPER_ADMIN, ADMIN]
booking:reject       - Reject booking                [SUPER_ADMIN, ADMIN]
booking:cancel       - Cancel booking                [SUPER_ADMIN, ADMIN]
```

### Role & User Management (SUPER_ADMIN ONLY)

```
role:list            - View roles                    [SUPER_ADMIN, ADMIN]
role:assign          - Assign roles to users         [SUPER_ADMIN] ⚠️ ADMIN CAN'T ASSIGN
role:create          - Create new role               [SUPER_ADMIN] ⚠️ ADMIN CAN'T CREATE
role:update          - Update role details           [SUPER_ADMIN] ⚠️ ADMIN CAN'T UPDATE
role:delete          - Delete role                   [SUPER_ADMIN] ⚠️ ADMIN CAN'T DELETE

user:list            - List all users                [SUPER_ADMIN, ADMIN]
user:edit            - Edit user profile             [SUPER_ADMIN, ADMIN]
user:delete          - Delete user                   [SUPER_ADMIN] ⚠️ ADMIN CAN'T DELETE
user:assign-role     - Assign roles                  [SUPER_ADMIN] ⚠️ ADMIN CAN'T ASSIGN
user:remove-role     - Remove roles                  [SUPER_ADMIN] ⚠️ ADMIN CAN'T REMOVE
```

### Analytics & Audit

```
analytics:view       - View analytics dashboard      [SUPER_ADMIN, ADMIN]
audit:view           - View audit logs               [SUPER_ADMIN, ADMIN]
```

---

## 3. COMPLETE TRIP WORKFLOW

### Phase 1: Creation

```
UPLOADER creates trip
├─ Status: DRAFT
├─ Only creator & SUPER_ADMIN/ADMIN can view
├─ Uploader can edit, delete
└─ No payment processing yet
```

### Phase 2: Media Upload

```
While in DRAFT:
├─ Uploader uploads images/videos via Media Library
├─ Videos processed by Cloudinary (optimized for web)
├─ Media stored with:
│  ├─ originalUrl: Full quality (backup)
│  ├─ mediumUrl: Optimized for display (1200px width)
│  └─ thumbUrl: Optimized for thumbnails (400x400)
└─ Trip cover image & gallery images linked to trip
```

### Phase 3: Review & Approval

```
Uploader submits trip
├─ Status: PENDING_REVIEW
├─ ADMIN receives notification (future)
├─ ADMIN views trip:view:internal
├─ If approved: trip:approve → Status: APPROVED
├─ If rejected: trip is kept as PENDING_REVIEW
└─ ADMIN publishes: trip:publish → Status: PUBLISHED
```

### Phase 4: Live & Bookings

```
Trip is PUBLISHED
├─ Visible on public pages (/trips)
├─ Users can browse & view details
├─ Users book via booking:create
├─ Bookings require payment (Stripe integration)
└─ ADMIN/TRIP_MANAGER approve:booking
```

### Phase 5: Operations

```
Trip is active (started)
├─ TRIP_GUIDE views: trip:view:guests
├─ TRIP_GUIDE updates: trip:update-status (IN_PROGRESS → COMPLETED)
├─ TRIP_MANAGER assigns guides: trip:assign-guide
├─ ADMIN views all trip details: trip:view:internal
└─ Guests see updates in their dashboard
```

### Phase 6: Completion

```
Trip ends
├─ Status: COMPLETED
├─ ADMIN archives if needed: trip:archive → ARCHIVED
├─ Reviews can be submitted by participants
└─ Trip moves to portfolio/past trips
```

---

## 4. VIDEO UPLOAD WORKFLOW (MEDIA SYSTEM)

### Current Implementation

**Frontend Flow:**

```
1. User navigates to /admin/media
2. Clicks "Upload Asset" button
3. Selects video file (mp4, webm accepted)
4. Frontend sends to POST /media/upload
```

**Backend Processing:**

```
1. Multer middleware processes file
   └─ Uploaded to disk: /uploads/videos/{filename}

2. uploadImage controller:
   ├─ Detects video type (video/mp4, video/webm)
   ├─ Creates URL paths:
   │  ├─ originalUrl: /uploads/videos/filename.mp4
   │  ├─ mediumUrl: /uploads/videos/filename.mp4 (same currently)
   │  └─ thumbUrl: /uploads/videos/filename.mp4 (same, should extract frame)
   └─ Stores in DB as IMAGE record with type: "VIDEO"

3. Database stores:
   ├─ File metadata (size, mimeType)
   ├─ Duration (if extracted)
   └─ uploadedById (user who uploaded)
```

**Retrieval Flow:**

```
1. GET /media?type=VIDEO fetches all videos
2. listMedia controller returns media items
3. Frontend renders in gallery with video icons
4. Video URLs used in trips/blogs as needed
```

---

## 5. HERO SLIDES WORKFLOW (Homepage Videos)

### What are Hero Slides?

Hero slides are the **full-width video carousel at the top of the homepage**. Each slide can have:

- Title & subtitle
- Background video
- CTA link
- Display order

### Current Setup

```
Database table: HeroSlide
├─ id: unique identifier
├─ title: Hero slide title
├─ subtitle: Optional subtitle
├─ videoUrl: URL to video (from Media Library)
├─ ctaLink: Optional link (/trips, /about, etc)
├─ order: Display sequence
└─ createdAt/updatedAt: Timestamps
```

### Frontend Display (Hero.tsx Component)

```
1. Page loads → fetches /content/hero-slides
2. Component receives heroSlides as prop
3. For each slide:
   ├─ If videoUrl exists:
   │  └─ Render <video src={videoUrl} autoPlay muted loop />
   └─ Else:
      └─ Use gradient background + unsplash image
4. Carousel auto-advances every 6 seconds
```

### Admin Management (Future: `/admin/hero-slides`)

```
Should allow SUPER_ADMIN/ADMIN to:
├─ Create new slides
├─ Upload video to Media Library first
├─ Reference video URL in slide
├─ Edit title, subtitle, CTA link
├─ Reorder slides
└─ Delete slides
```

---

## 6. IDENTIFIED ISSUES & FIXES

### Issue 1: Videos Not Uploading to Media Library

**Problem:** Upload endpoint exists but may have permissions issue
**Root Cause:** Permission check missing or incorrect
**Fix Status:** ⚠️ NEEDS FIX - No `requirePermission("media:upload")` on POST /media/upload

**Solution:**

```typescript
// apps/api/src/routes/media.routes.ts
router.post(
  "/upload",
  requireAuth,
  requirePermission("media:upload"), // ← ADD THIS LINE
  upload.single("file"),
  uploadImage
);
```

### Issue 2: Videos Not Showing on Homepage

**Problem:** Hero slides don't display videos
**Possible Causes:**

1. No hero slides in database
2. Hero slides have empty videoUrl
3. Video URLs not accessible

**Diagnosis Script:**

```bash
# Check hero slides
cd apps/api
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.heroSlide.findMany().then(r => {
  console.log('Hero Slides:', JSON.stringify(r, null, 2));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
"
```

### Issue 3: Video Processing (Optimization)

**Current:** Videos stored with same URL for all qualities
**Needed:** Different URLs for original, medium, thumbnail
**Status:** PARTIALLY IMPLEMENTED (code exists, may not work on local storage)

---

## 7. DATABASE SCHEMA

### Key Tables

**Role** - System roles

```
id, name, description, isSystem, createdAt
├─ SUPER_ADMIN (isSystem: true)
├─ ADMIN (isSystem: false)
├─ TRIP_MANAGER (isSystem: true)
├─ TRIP_GUIDE (isSystem: true)
├─ UPLOADER (isSystem: true)
└─ USER (isSystem: false)
```

**Permission** - Permission keys

```
id, key, description, category, createdAt
├─ trip:* (Trip category)
├─ booking:* (Booking category)
├─ blog:* (Blog category)
├─ media:* (Media category)
├─ role:* (Role category)
├─ user:* (User category)
└─ analytics:*, audit:* (Admin category)
```

**RolePermission** - M2M mapping

```
roleId, permissionId
├─ Links roles to permissions
└─ Determines what each role can do
```

**Image** - Media files

```
id, originalUrl, mediumUrl, thumbUrl, type (IMAGE|VIDEO)
size, mimeType, duration (for video), uploadedById, createdAt
```

**HeroSlide** - Homepage slides

```
id, title, subtitle, videoUrl, ctaLink, order, createdAt, updatedAt
```

**Trip** - Adventures

```
id, name, status (DRAFT|PENDING_REVIEW|APPROVED|PUBLISHED|COMPLETED|ARCHIVED)
category, description, price, duration, maxGuests, createdById, coverImageId
```

---

## 8. PERMISSION ENFORCEMENT

### Three Layers of Security

**Layer 1: Middleware - attachPermissions**

```
- Runs AFTER auth middleware
- Grants role-based failsafe permissions
- SUPER_ADMIN gets 67+ permissions automatically
- ADMIN gets 61+ permissions automatically
- Prevents 403 errors from missing DB permissions
```

**Layer 2: Route Protection - requirePermission**

```
router.post("/media/upload",
  requireAuth,              // ← User must be logged in
  requirePermission("media:upload"),  // ← User must have permission
  upload.single("file"),
  uploadImage
);
```

**Layer 3: Frontend - PermissionRoute Component**

```tsx
<PermissionRoute permission="media:view">
  <MediaLibrary /> {/* Only renders if user has permission */}
</PermissionRoute>
```

---

## 9. TEST ACCOUNTS

```
Super Admin Account:
├─ Email: admin@paramadventures.com
├─ Password: Admin@123
├─ Roles: SUPER_ADMIN + ADMIN
└─ Permissions: 67+ (full access)

Regular User Account:
├─ Email: user@paramadventures.com
├─ Password: User@123
├─ Role: USER
└─ Permissions: 5 (read-only)
```

---

## 10. QUICK START COMMANDS

**Check permissions for a user:**

```bash
cd apps/api
npx ts-node scripts/check-user-permissions.ts
```

**Verify role structure:**

```bash
npx ts-node scripts/fix-complete-roles.ts
```

**Seed production data:**

```bash
npx ts-node scripts/seed-production-complete.ts
```

**Sync route permissions to DB:**

```bash
npx ts-node scripts/sync-route-permissions.ts
```

---

## 11. COMMON ISSUES & SOLUTIONS

| Issue                        | Cause                             | Solution                                       |
| ---------------------------- | --------------------------------- | ---------------------------------------------- |
| 403 on media upload          | Missing `media:upload` permission | Check user role & route middleware             |
| Videos not in Media Library  | Upload endpoint not called        | Check frontend upload handler                  |
| Hero slides empty            | No data in DB                     | Seed with hero slide data                      |
| Videos showing broken        | Invalid URL path                  | Verify Cloudinary setup or local upload folder |
| ADMIN can't edit roles       | Correct behavior                  | Only SUPER_ADMIN can manage roles              |
| SUPER_ADMIN sees "Read Only" | Frontend bug fixed                | Update RoleCard to pass `isSuperAdmin` prop    |

---

## 12. KEY FILES & LOCATIONS

```
Frontend:
├─ /apps/web/src/app/page.tsx              (Home page - fetches hero slides)
├─ /apps/web/src/components/home/Hero.tsx  (Hero carousel component)
├─ /apps/web/src/app/admin/media/page.tsx  (Media library UI)
└─ /apps/web/src/app/admin/roles/page.tsx  (Roles & permissions UI)

Backend:
├─ /apps/api/src/routes/media.routes.ts    (Media endpoints)
├─ /apps/api/src/routes/content.routes.ts  (Hero slides endpoints)
├─ /apps/api/src/controllers/mediaUpload.controller.ts
├─ /apps/api/src/controllers/content/heroSlide.controller.ts
└─ /apps/api/src/middlewares/permission.middleware.ts (Permission logic)

Database:
└─ /apps/api/prisma/schema.prisma          (All DB tables)
```

---

**Last Updated:** January 18, 2026
**Status:** Production Ready with Issues Identified
