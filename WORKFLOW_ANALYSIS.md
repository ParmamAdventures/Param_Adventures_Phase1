# Complete Application Workflow Analysis

**Analysis Date:** January 18, 2026  
**Analyzed By:** AI Assistant  
**Purpose:** Deep dive into all application workflows with questions and observations

---

## 1. TRIP LIFECYCLE WORKFLOW

### Phase 1: Creation (DRAFT)

```
Actor: UPLOADER, ADMIN, or SUPER_ADMIN
Permission Required: trip:create
Status: DRAFT → Initial state
```

**Frontend Flow:**

1. User navigates to `/admin/trips/new`
2. `PermissionRoute` checks for `trip:create` permission
3. `TripForm` component renders with all fields:
   - Basic: title, slug, description, location, price, duration, difficulty
   - Details: startPoint, endPoint, altitude, distance, category
   - Media: coverImageId, heroImageId, gallery (array of image IDs)
   - Rich Content: itinerary (JSON), highlights, inclusions, exclusions
   - Advanced: cancellationPolicy, thingsToPack, faqs, seasons
   - Scheduling: startDate, endDate, capacity
4. User fills form and submits

**Backend Flow:**

1. POST `/trips` → `createTrip` controller
2. Validates user has `trip:create` permission
3. Creates trip with status = `DRAFT`
4. Associates `createdById` with current user
5. Creates gallery images if provided (TripGalleryImage junction table)
6. Creates audit log: `TRIP_CREATED`
7. Returns trip object with relations

**Database State After Creation:**

```sql
Trip {
  id: uuid
  status: DRAFT
  createdById: user.id
  approvedById: null
  publishedAt: null
  coverImageId: uuid (optional)
  heroImageId: uuid (optional)
  gallery: TripGalleryImage[] (junction with Image)
}
```

---

### Phase 2: Submission (DRAFT → PENDING_REVIEW)

```
Actor: Trip Creator (owner)
Permission Required: trip:submit (UPLOADER, ADMIN, SUPER_ADMIN have this)
Status Transition: DRAFT → PENDING_REVIEW
```

**Frontend Flow:**

1. Creator navigates to `/admin/trips` or `/admin/trips/[tripId]`
2. Sees "Submit for Review" button
3. Clicks button → POST `/trips/:id/submit`

**Backend Flow:**

1. `submitTrip` controller validates:
   - Trip exists
   - User is trip owner (`trip.createdById === user.id`)
   - Current status is `DRAFT` (strict transition)
2. Updates trip: `status = PENDING_REVIEW`
3. Creates audit log: `TRIP_SUBMITTED`
4. Returns updated trip

**Observation:**

- Only trip owner can submit
- No validation for required fields (should there be?)
- No notification sent to ADMIN (future feature?)

**❓ QUESTION 1:** Should there be validation before submission?

- Check if coverImageId exists?
- Check if itinerary is filled?
- Check if price > 0?
- Check if gallery has at least one image?

---

### Phase 3: Approval (PENDING_REVIEW → APPROVED)

```
Actor: ADMIN or SUPER_ADMIN
Permission Required: trip:approve
Status Transition: PENDING_REVIEW → APPROVED
```

**Frontend Flow:**

1. ADMIN navigates to `/admin/moderation` page
2. Sees list of trips with status `PENDING_REVIEW`
3. Clicks "Approve" button
4. POST `/trips/:id/approve`

**Backend Flow:**

1. `approveTrip` controller validates:
   - Trip exists
   - Current status is `PENDING_REVIEW` (strict transition)
2. Updates trip:
   - `status = APPROVED`
   - `approvedById = user.id` (tracks who approved)
3. Creates audit log: `TRIP_APPROVED`
4. Returns updated trip

**Observation:**

- No content quality check
- No automated validation
- Approval is one-click action

**❓ QUESTION 2:** What happens if ADMIN wants to reject a trip?

- I don't see a `rejectTrip` controller
- Should there be a REJECTED status?
- Should rejections have a reason field?
- Can rejected trips be resubmitted?

---

### Phase 4: Publishing (APPROVED → PUBLISHED)

```
Actor: ADMIN or SUPER_ADMIN
Permission Required: trip:publish
Status Transition: APPROVED → PUBLISHED
```

**Frontend Flow:**

1. ADMIN navigates to trip list or moderation page
2. Sees trips with status `APPROVED`
3. Clicks "Publish" button
4. POST `/trips/:id/publish`

**Backend Flow:**

1. `publishTrip` controller validates:
   - Trip exists
   - Current status is `APPROVED` (strict transition)
2. Updates trip:
   - `status = PUBLISHED`
   - `publishedAt = new Date()` (timestamp when went live)
3. Creates audit log: `TRIP_PUBLISHED`
4. Returns updated trip

**Key Point:** Only PUBLISHED trips appear on:

- Homepage (featured section)
- `/trips` public listing
- `/trips/[slug]` public detail page

**Public Access:**

```typescript
// apps/api/src/routes/trips.routes.ts
router.get("/public", getPublicTrips);
// Filters: where: { status: "PUBLISHED" }

router.get("/public/:slug", getTripBySlug);
// Returns 404 if status !== PUBLISHED
```

---

### Phase 5: Operations (PUBLISHED → IN_PROGRESS → COMPLETED)

```
Actor: TRIP_MANAGER or TRIP_GUIDE
Permissions: trip:update-status, trip:assign-guide
Status Transitions:
  PUBLISHED → IN_PROGRESS (when trip starts)
  IN_PROGRESS → COMPLETED (when trip ends)
```

**Trip Manager Actions:**

1. Assign guides to trip
   - Permission: `trip:assign-guide`
   - Creates `TripsOnGuides` junction record
   - Guide can now see trip in their dashboard
2. Update trip status
   - Permission: `trip:update-status`
   - Changes PUBLISHED → IN_PROGRESS when trip starts
   - Changes IN_PROGRESS → COMPLETED when trip ends

**Trip Guide Actions:**

1. View assigned trips
   - Permission: `trip:view:guests`
   - Can see booking list with guest details
2. Update trip status
   - Permission: `trip:update-status`
   - Can mark IN_PROGRESS → COMPLETED

**Database Relations:**

```sql
Trip {
  managerId: uuid (optional)
  manager: User (TRIP_MANAGER role)
  guides: TripsOnGuides[] (M2M with User via junction)
}

TripsOnGuides {
  tripId: uuid
  userId: uuid (user with TRIP_GUIDE role)
  assignedAt: DateTime
}
```

**❓ QUESTION 3:** Trip operational workflow unclear:

- Who sets startDate/endDate? Creator during DRAFT or Manager before publishing?
- Does the system auto-transition IN_PROGRESS on startDate?
- How does guide assignment work in the UI? (I don't see `/admin/trips/[id]/assign-guide`)
- Can guides reject assignments?
- Can multiple guides be assigned to one trip?

---

### Phase 6: Archival (PUBLISHED/COMPLETED → ARCHIVED)

```
Actor: ADMIN or SUPER_ADMIN
Permission Required: trip:archive
Status Transition: Any status → ARCHIVED
```

**Backend Flow:**

1. POST `/trips/:id/archive`
2. `archiveTrip` controller updates `status = ARCHIVED`
3. Creates audit log: `TRIP_ARCHIVED`

**Restoration:**

1. POST `/trips/:id/restore`
2. `restoreTrip` controller updates status back (to what?)

**❓ QUESTION 4:** Archive/Restore logic unclear:

- What status does a trip restore to? PUBLISHED? DRAFT?
- Are ARCHIVED trips visible anywhere in admin panel?
- Can ARCHIVED trips accept bookings? (should be blocked)
- Should completed trips auto-archive after X days?

---

## 2. BLOG LIFECYCLE WORKFLOW

### Blog Status Flow

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
                      ↓
                   REJECTED
```

**Actors & Permissions:**

- **Create Draft:** USER, UPLOADER, ADMIN, SUPER_ADMIN (`blog:create`)
- **Submit:** Owner (`blog:submit`)
- **Approve/Reject:** ADMIN, SUPER_ADMIN (`blog:approve`, `blog:reject`)
- **Publish:** ADMIN, SUPER_ADMIN (`blog:publish`)

### Frontend Blog Creation Flow

1. User navigates to `/admin/blogs/new`
2. `BlogEditor` component renders with:
   - Title input
   - Excerpt (short description)
   - Content (rich text editor - TipTap with extensions)
   - Cover image picker (from media library)
   - Trip association (optional - link blog to a trip)
   - Theme selector (default: "modern")
3. User writes content using editor features:
   - Bold, italic, underline, headings
   - Image upload
   - YouTube video embed
   - Lists, blockquotes
4. Saves as DRAFT

### Backend Blog Creation

```typescript
POST /blogs → createBlog controller
- Permission: blog:create
- Status: DRAFT
- authorId: current user
- coverImageId: optional
- tripId: optional (associate blog with trip)
- content: JSON (editor output)
```

### Blog Submission → Review

1. Owner clicks "Submit for Review"
2. POST `/blogs/:id/submit`
3. Status: DRAFT → PENDING_REVIEW
4. Blog appears in `/admin/moderation` page

### Blog Approval Process

**Option A: Approve**

```
POST /blogs/:id/approve
- Permission: blog:approve
- Status: PENDING_REVIEW → APPROVED
- Audit log: BLOG_APPROVED
```

**Option B: Reject**

```
POST /blogs/:id/reject
- Permission: blog:reject
- Status: PENDING_REVIEW → REJECTED
- Audit log: BLOG_REJECTED
```

**❓ QUESTION 5:** What happens to REJECTED blogs?

- Can author edit and resubmit?
- Is there a rejection reason field?
- Where do rejected blogs appear in UI?

### Blog Publishing

```
POST /blogs/:id/publish
- Permission: blog:publish (but controller has special logic)
- Status: APPROVED → PUBLISHED
- Visible on /blogs public page
```

**Special Logic:** Controller allows owner to publish if already APPROVED (I see comment in code)

---

## 3. BOOKING & PAYMENT WORKFLOW

### Booking Creation Flow (User Journey)

**Frontend:**

1. User browses `/trips` page
2. Clicks on trip → `/trips/[slug]`
3. Views trip details, clicks "Book Now"
4. `TripBookingCard` component shows booking form:
   - Start date picker (must be within trip's available dates)
   - Number of guests
   - Guest details (name, email, age, gender for each guest)
5. User fills form, clicks "Create Booking"
6. POST `/bookings`

**Backend Booking Creation:**

```typescript
POST /bookings → createBooking controller
Required Fields:
- tripId: uuid
- startDate: DateTime
- guests: number
- guestDetails: JSON array

Process:
1. Fetch trip details
2. Validate:
   - Trip exists and is PUBLISHED
   - startDate is valid
   - guests <= trip.capacity
   - guests > 0
3. Calculate totalPrice = trip.price * guests
4. Create Booking:
   - userId: current user
   - status: REQUESTED (initial state)
   - paymentStatus: PENDING
   - totalPrice: calculated amount
5. Return booking object
```

**Database State After Booking:**

```sql
Booking {
  id: uuid
  userId: uuid
  tripId: uuid
  status: REQUESTED
  paymentStatus: PENDING
  startDate: DateTime
  guests: number
  guestDetails: JSON
  totalPrice: number (in INR)
  createdAt: DateTime
}
```

---

### Payment Flow (Razorpay Integration)

**Step 1: Initiate Payment**

```
User navigates to /my-bookings
Sees booking with "Pay Now" button
Clicks button → POST /bookings/:id/initiate-payment
```

**Backend:**

```typescript
initiatePayment controller:
1. Validate:
   - Booking exists
   - User owns booking (security check)
   - paymentStatus !== PAID (prevent double payment)
   - status !== CANCELLED/REJECTED
2. Calculate amount in paise: totalPrice * 100
3. Create Razorpay Order via SDK:
   - razorpay.orders.create({ amount, currency: "INR", receipt: bookingId })
4. Save Payment record:
   - provider: "razorpay"
   - providerOrderId: order.id
   - amount: amountInPaise
   - status: CREATED
5. Queue notification: "SEND_PAYMENT_INITIATED"
6. Return to frontend:
   - orderId: razorpay order ID
   - amount: amount in paise
   - keyId: RAZORPAY_KEY_ID (public key)
```

**Step 2: Frontend Razorpay Checkout**

```javascript
// Frontend receives orderId, amount, keyId
const options = {
  key: keyId,
  amount: amount,
  currency: "INR",
  order_id: orderId,
  name: "Param Adventures",
  description: trip.title,
  handler: function(response) {
    // Payment successful
    // Verify payment with backend
    POST /bookings/:id/verify-payment
    {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature
    }
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

**Step 3: Payment Verification**

```typescript
POST /bookings/:id/verify-payment → verifyPayment controller

1. Receive from frontend:
   - razorpay_payment_id
   - razorpay_order_id
   - razorpay_signature

2. Verify signature (security check):
   - HMAC SHA256(order_id + "|" + payment_id, secret)
   - Compare with razorpay_signature

3. If valid:
   - Fetch payment details from Razorpay API
   - Update Payment record:
     - providerPaymentId: payment_id
     - status: CAPTURED
     - method: payment method (card/upi/netbanking)
     - rawPayload: full payment object
   - Update Booking:
     - paymentStatus: PAID
     - status: CONFIRMED (or keep as REQUESTED?)
   - Create audit log: PAYMENT_CAPTURED
   - Queue notification: "SEND_PAYMENT_CONFIRMATION"

4. If invalid:
   - Log error
   - Mark payment as FAILED
   - Return error to frontend
```

**❓ QUESTION 6:** Booking status after payment unclear:

- Does `status` change from REQUESTED to CONFIRMED after payment?
- Or does ADMIN manually approve with `booking:approve` permission?
- What's the difference between paymentStatus=PAID and status=CONFIRMED?
- Can a booking be CONFIRMED without payment? (offline/manual payments?)

---

### Booking Approval (Admin)

```
Permission: booking:approve (SUPER_ADMIN, ADMIN)
Endpoint: POST /bookings/:id/approve (not implemented yet?)
```

**❓ QUESTION 7:** Missing booking approval endpoint:

- I see `booking:approve` permission in roles
- But no `/bookings/:id/approve` route in bookings.routes.ts
- Should ADMIN manually confirm bookings after payment?
- Or is paymentStatus=PAID sufficient?

---

### Booking Cancellation

```
User Action: POST /bookings/:id/cancel
Backend: cancelBooking controller
Process:
1. Validate user owns booking
2. Check if cancellable (status !== COMPLETED/CANCELLED)
3. Update status: CANCELLED
4. If payment exists and PAID:
   - Initiate refund? (manual process?)
   - Or just mark as cancelled, refund separately?
```

**❓ QUESTION 8:** Refund workflow:

- Is cancellation automatic or requires ADMIN approval?
- Does `/bookings/:id/cancel` trigger automatic refund?
- Or does ADMIN manually refund via `/bookings/:id/refund`?
- What's the refund policy enforcement? (cancellationPolicy field in Trip)

---

### Payment Webhook (Razorpay)

```
Razorpay → POST /webhooks/razorpay
Backend: razorpayWebhook controller

Events:
- payment.captured
- payment.failed
- refund.processed
- refund.failed

Process:
1. Verify webhook signature
2. Parse event payload
3. Find Payment by providerOrderId or providerPaymentId
4. Update Payment status
5. Update Booking paymentStatus
6. Queue notifications
```

**This handles:**

- Late payment captures
- Payment failures
- Refund confirmations
- Disputes

---

## 4. USER REGISTRATION & AUTHENTICATION

### Registration Flow

```
Frontend: /signup page
POST /auth/register

Required:
- email: string (unique)
- password: string (min 8 chars)
- name: string

Backend:
1. Validate email format
2. Check if email already exists
3. Hash password (bcrypt)
4. Create User:
   - status: ACTIVE
   - Assign default role: USER
5. Create UserRole junction record
6. Generate JWT tokens:
   - accessToken (15 min expiry)
   - refreshToken (7 days expiry)
7. Return tokens + user object
```

### Login Flow

```
POST /auth/login
Body: { email, password }

Backend:
1. Find user by email
2. Compare password hash
3. Check status (block if SUSPENDED/BANNED)
4. Generate new tokens
5. Return tokens + user object
```

### Token Refresh

```
POST /auth/refresh
Body: { refreshToken }

Backend:
1. Verify refreshToken signature
2. Check if token expired
3. Find user by token payload
4. Generate new accessToken
5. Optionally rotate refreshToken
6. Return new tokens
```

### Social Auth (Google OAuth)

```
POST /auth/google
Body: { idToken } (from Google Sign-In)

Backend:
1. Verify idToken with Google
2. Extract email, name, picture
3. Find or create user:
   - If exists: update googleId
   - If new: create with googleId, no password
4. Generate tokens
5. Return tokens + user
```

---

## 5. ROLE ASSIGNMENT WORKFLOW

### Default Role Assignment

```
During registration:
- New users get USER role automatically
- UserRole junction created: (userId, roleId="USER")
```

### Admin Role Assignment

```
Actor: SUPER_ADMIN only
Permission: user:assign-role
Frontend: /admin/users page

Process:
1. SUPER_ADMIN navigates to user list
2. Clicks "Edit Roles" on user
3. Selects roles from dropdown (multi-select)
4. Saves → POST /admin/users/:id/roles

Backend:
1. Validate actor has user:assign-role permission
2. Delete existing UserRole records for user
3. Create new UserRole records for selected roles
4. Return updated user with roles
5. Create audit log: USER_ROLE_ASSIGNED
```

**❓ QUESTION 9:** Role assignment restrictions:

- Can ADMIN assign roles? (No - only SUPER_ADMIN has user:assign-role)
- Can SUPER_ADMIN assign SUPER_ADMIN role to others? (Should there be a check?)
- Can roles be removed? (Yes - by not selecting them)
- What happens if all roles removed? (Should USER be minimum required?)

---

## 6. MEDIA UPLOAD & MANAGEMENT

### Upload Flow

```
Frontend: /admin/media page
Component: File input with "Upload Asset" button

User Actions:
1. Click "Upload Asset"
2. Select file (image or video)
3. File validates: image/* or video/mp4, video/webm
4. POST /media/upload (multipart/form-data)
```

### Backend Processing

```typescript
POST /media/upload
Middleware:
1. requireAuth
2. requirePermission("media:upload")
3. upload.single("file") (Multer)

Process:
1. Multer saves file to disk or Cloudinary
2. uploadImage controller:
   - Detect type: image vs video (via mimeType)
   - Generate URLs:
     * Local: http://localhost:3001/uploads/images/file-123.jpg
     * Cloudinary: https://res.cloudinary.com/.../upload/v123/file.jpg
   - Create Image record:
     - originalUrl
     - mediumUrl (optimized for display)
     - thumbUrl (optimized for thumbnails)
     - type: IMAGE or VIDEO
     - mimeType
     - size
     - uploadedById
3. Return image object with URLs
```

### Media Usage Tracking

```sql
Image {
  tripsCover: Trip[] (inverse of coverImageId)
  tripsHero: Trip[] (inverse of heroImageId)
  tripsGallery: TripGalleryImage[]
  blogsCover: Blog[]
  userAvatar: User[]
}

When fetching media list:
Include _count of each relation
Show usage stats: "Used in 3 trips, 1 blog"
```

### Media Deletion

```
DELETE /media/:id
Permission: media:delete (SUPER_ADMIN, ADMIN)

Validation:
- Check if media is in use (count relations)
- If in use: return error "Cannot delete, in use"
- If not in use: delete from DB
- TODO: Delete actual file from disk/Cloudinary
```

**❓ QUESTION 10:** Media deletion safety:

- Should deletion check be strict? (block if any usage)
- Or should it cascade delete (dangerous)?
- Should there be "soft delete" (mark as deleted, keep file)?
- Is there a way to replace media across all usages?

---

## 7. REVIEW & RATING SYSTEM

### Review Submission

```
Actor: USER with completed booking
Permission: review:create (?)

Frontend:
1. User goes to /my-bookings
2. Sees completed booking with "Write Review" button
3. Clicks → review form:
   - Rating (1-5 stars)
   - Comment (text)
   - Optional: photo upload
4. POST /reviews

Backend:
1. Validate:
   - User has booking for this trip
   - Booking status = COMPLETED
   - User hasn't reviewed this trip yet (unique constraint?)
2. Create Review:
   - userId
   - tripId
   - rating
   - comment
   - verified: true (because tied to booking)
3. Update trip average rating
4. Return review
```

**❓ QUESTION 11:** Review system details:

- Can users review without booking? (should be blocked)
- Can users edit reviews after submission?
- Can ADMIN moderate/delete inappropriate reviews?
- How is average rating calculated? (aggregate on trip?)

---

## 8. INQUIRY SYSTEM (Pre-booking Queries)

```
Actor: Any visitor (no auth required)
Frontend: /trips/[slug] page has "Enquire" button

User Actions:
1. Click "Enquire"
2. Fill form:
   - name
   - email
   - phone
   - message
   - tripId (auto-filled)
3. POST /inquiries

Backend:
1. Create TripInquiry record
2. Queue email notification to ADMIN
3. Return success
```

**❓ QUESTION 12:** Inquiry management:

- Where does ADMIN view inquiries? (/admin/inquiries?)
- Can ADMIN reply to inquiries?
- Are inquiries linked to users if authenticated?
- Is there follow-up tracking?

---

## 9. WISHLIST / SAVED TRIPS

```
Actor: Authenticated USER
Frontend: /trips/[slug] has "Save" button

User Actions:
1. Click "Save Trip" → POST /trips/:id/save
2. Trip added to wishlist
3. View saved trips: /dashboard/saved-trips

Backend:
- SavedTrip junction table (userId, tripId, savedAt)
- Unique constraint to prevent duplicates
```

---

## 10. ANALYTICS & AUDIT LOGS

### Analytics Dashboard

```
Frontend: /admin/analytics
Permission: analytics:view (SUPER_ADMIN, ADMIN)

Metrics:
- Total trips (by status)
- Total bookings (by status)
- Total revenue (sum of PAID bookings)
- Pending moderation count
- User growth (registrations over time)
- Popular trips (by booking count)
```

### Audit Logs

```
Captured Events:
- TRIP_CREATED, TRIP_SUBMITTED, TRIP_APPROVED, TRIP_PUBLISHED, TRIP_ARCHIVED
- BLOG_CREATED, BLOG_SUBMITTED, BLOG_APPROVED, BLOG_REJECTED, BLOG_PUBLISHED
- BOOKING_CREATED, BOOKING_CANCELLED
- PAYMENT_CAPTURED, PAYMENT_FAILED, PAYMENT_REFUNDED
- USER_ROLE_ASSIGNED, USER_STATUS_CHANGED

Frontend: /admin/audit-logs
Permission: audit:view
Shows who did what, when, on which resource
```

---

## 11. NOTIFICATION SYSTEM (Queue-based)

```
Queue: notificationQueue (Bull/BullMQ)

Job Types:
- SEND_WELCOME_EMAIL (after registration)
- SEND_PASSWORD_RESET (forgot password)
- SEND_BOOKING_CONFIRMATION (after booking created)
- SEND_PAYMENT_INITIATED (when payment started)
- SEND_PAYMENT_CONFIRMATION (after successful payment)
- SEND_BOOKING_CANCELLED (after cancellation)
- SEND_TRIP_SUBMITTED_NOTIFICATION (to ADMIN)
- SEND_TRIP_APPROVED_NOTIFICATION (to creator)
- SEND_REVIEW_REQUEST (after trip completion)

Implementation:
- Jobs queued asynchronously
- Worker processes jobs
- Email service (Nodemailer/SendGrid)
- Retry on failure
```

---

## CRITICAL QUESTIONS & ISSUES IDENTIFIED

### 🔴 HIGH PRIORITY

**Q1: Trip Rejection Workflow Missing**

- There's no reject endpoint for trips
- ADMIN can approve but not reject
- Need: POST `/trips/:id/reject` with reason field
- Add REJECTED status to TripStatus enum

**Q2: Booking Approval Logic Unclear**

- Is `booking:approve` permission actually used?
- Should bookings auto-confirm after payment?
- Or does ADMIN manually approve even after payment?
- Current: paymentStatus=PAID doesn't change booking.status

**Q3: Trip-Guide Assignment UI Missing**

- Schema has managerId and guides relation
- But no `/admin/trips/[id]/assign` page in frontend
- trip:assign-guide permission exists but endpoint unclear
- Need UI for TRIP_MANAGER to assign guides

**Q4: Refund Workflow Incomplete**

- Cancellation doesn't trigger refund
- Refund is SUPER_ADMIN only via POST `/bookings/:id/refund`
- No partial refund support visible
- No refund policy enforcement from Trip.cancellationPolicy

### 🟡 MEDIUM PRIORITY

**Q5: Blog Rejection Recovery**

- REJECTED blogs: can author resubmit?
- No "resubmit" endpoint visible
- Should REJECTED → DRAFT be allowed?

**Q6: Media Deletion Safety**

- No cascade protection
- Deleting in-use media breaks trips/blogs
- Need strict usage check before deletion

**Q7: Archive/Restore States**

- What status does restored trip get?
- Should ARCHIVED trips be hidden from moderation?

**Q8: Review System Enforcement**

- Can users review without completed booking?
- One review per trip per user?
- Review moderation by ADMIN?

### 🟢 LOW PRIORITY

**Q9: Inquiry Management UI**

- Where does ADMIN reply to inquiries?
- Is there an /admin/inquiries page?

**Q10: Role Assignment Guards**

- Can SUPER_ADMIN create more SUPER_ADMINs?
- Should there be a max limit?

**Q11: Trip Start Date Enforcement**

- Does trip auto-transition to IN_PROGRESS on startDate?
- Or is it manual via trip:update-status?

---

## STATE DIAGRAMS

### Trip State Machine

```
       [CREATE]
          ↓
        DRAFT ←→ [EDIT allowed by owner]
          ↓ [SUBMIT by owner]
   PENDING_REVIEW
          ↓ [APPROVE by ADMIN]
       APPROVED
          ↓ [PUBLISH by ADMIN]
      PUBLISHED
          ↓ [START by MANAGER]
     IN_PROGRESS
          ↓ [COMPLETE by GUIDE/MANAGER]
      COMPLETED
          ↓ [ARCHIVE by ADMIN]
       ARCHIVED
          ↓ [RESTORE by ADMIN]
    (back to what?)

Note: REJECTED state doesn't exist in schema but should!
```

### Booking + Payment State Machine

```
Booking States:
REQUESTED → CONFIRMED → COMPLETED
         ↓           ↓
    CANCELLED    CANCELLED
         ↓
    REJECTED (?)

Payment States:
CREATED → AUTHORIZED → CAPTURED
                    ↓
                  FAILED
                    ↓
                REFUNDED
```

### Blog State Machine

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
                       ↓
                   REJECTED
                       ↓
                (can't resubmit?)
```

---

## SECURITY OBSERVATIONS

### ✅ Good Practices

1. **Three-layer permission checking:**
   - Middleware: attachPermissions (failsafe grants)
   - Route: requirePermission("key")
   - Frontend: PermissionRoute component

2. **Audit logging:** All sensitive actions logged

3. **JWT tokens:** Access + refresh token pattern

4. **Payment verification:** HMAC signature validation

5. **Ownership checks:** Controllers validate user owns resource

### ⚠️ Potential Issues

1. **No rate limiting visible:** API routes unprotected from spam

2. **No input sanitization:** XSS risk in blog content?

3. **File upload limits:** Max file size enforced?

4. **SQL injection:** Using Prisma (safe), but raw queries?

5. **Webhook signature validation:** Is it strict enough?

---

## PERFORMANCE OBSERVATIONS

### Database Queries

- **N+1 problem risk:** Trip list queries include multiple relations
- **Pagination:** Implemented on trips/blogs (good)
- **Indexes:** Present on status, slug, createdAt (good)
- **Full-text search:** Prisma preview feature enabled

### Caching

- **Static pages:** Next.js ISR used? (check revalidate)
- **API responses:** No visible caching layer
- **Redis:** Mentioned in docs but not implemented?

### Media Delivery

- **Cloudinary:** Optimized URLs generated (good)
- **Local storage:** No CDN for local files
- **Video optimization:** Cloudinary transforms applied

---

## MISSING FEATURES / TODOS

1. **Email notifications** - Queue exists but worker implementation?
2. **SMS notifications** - For booking confirmations
3. **Trip search** - Full-text search partially implemented
4. **Trip filters** - Category, price range, duration, difficulty
5. **User dashboard** - Shows bookings, reviews, saved trips
6. **Trip capacity management** - Prevent overbooking
7. **Dynamic pricing** - Based on season, demand
8. **Multi-language support** - I18n not implemented
9. **Mobile app** - No API versioning for app
10. **Admin reports** - PDF exports, CSV downloads

---

**Analysis Complete**  
**Total Questions Raised:** 12 critical workflow gaps  
**Status:** Ready for clarification and fixes
