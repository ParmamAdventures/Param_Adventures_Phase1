# Admin Guide - Param Adventures

Complete guide for Administrators, Trip Managers, and Trip Guides to manage the Param Adventures platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Roles & Permissions](#roles--permissions)
3. [Accessing Admin Dashboard](#accessing-admin-dashboard)
4. [Dashboard Overview](#dashboard-overview)
5. [Managing Trips](#managing-trips)
6. [Managing Bookings](#managing-bookings)
7. [Managing Users](#managing-users)
8. [Content Management](#content-management)
9. [Media Library](#media-library)
10. [Analytics](#analytics)
11. [System Logs](#system-logs)
12. [Best Practices](#best-practices)
13. [FAQ](#faq)

---

## 🎯 Overview

The Admin Dashboard provides comprehensive tools to manage all aspects of Param Adventures platform. Access and features depend on your assigned role.

**Dashboard URL**: `/admin/dashboard`

---

## 👥 Roles & Permissions

### Role Hierarchy

1. **SUPER_ADMIN** (Full Access)
2. **ADMIN** (Most Management Features)
3. **TRIP_MANAGER** (Trip & Booking Management)
4. **TRIP_GUIDE** (View & Update Assigned Trips)
5. **UPLOADER** (Media Management Only)
6. **USER** (Regular Customer - No Admin Access)

### Permission Matrix

| Feature                | Super Admin | Admin | Trip Manager | Trip Guide | Uploader |
| ---------------------- | :---------: | :---: | :----------: | :--------: | :------: |
| **Trips**              |
| View All Trips         |     ✅      |  ✅   |      ✅      |     ✅     |    ❌    |
| Create Trip            |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Edit Any Trip          |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Edit Assigned Trip     |     ✅      |  ✅   |      ✅      |     ✅     |    ❌    |
| Delete Trip            |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Publish Trip           |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Archive Trip           |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Assign Team            |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| **Bookings**           |
| View All Bookings      |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| View Assigned Bookings |     ✅      |  ✅   |      ✅      |     ✅     |    ❌    |
| Approve Booking        |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Reject Booking         |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Cancel Booking         |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Process Refund         |     ✅      |  ❌   |      ❌      |     ❌     |    ❌    |
| **Content**            |
| Manage Blogs           |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Approve Blog           |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Manage Hero Slides     |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| **Media**              |
| Upload Media           |     ✅      |  ✅   |      ✅      |     ✅     |    ✅    |
| Delete Media           |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| Manage Library         |     ✅      |  ✅   |      ❌      |     ❌     |    ✅    |
| **Users**              |
| View All Users         |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Edit User              |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Assign Roles           |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| Delete User            |     ✅      |  ❌   |      ❌      |     ❌     |    ❌    |
| **System**             |
| View Analytics         |     ✅      |  ✅   |      ✅      |     ❌     |    ❌    |
| View Audit Logs        |     ✅      |  ✅   |      ❌      |     ❌     |    ❌    |
| System Settings        |     ✅      |  ❌   |      ❌      |     ❌     |    ❌    |

---

## 🚪 Accessing Admin Dashboard

### Login as Admin

1. Go to website homepage
2. Click "Login" (top right)
3. Enter your admin credentials
4. After login, click your avatar → "Admin Dashboard"

Or directly visit: `/admin/dashboard`

### First Time Setup

If you're a newly assigned admin:

1. Login with your user account
2. Contact Super Admin to assign appropriate role
3. Logout and login again
4. Admin Dashboard will now be accessible

---

## 📊 Dashboard Overview

### Main Dashboard (`/admin/dashboard`)

**Widgets Display**:

- **Total Revenue**: All-time earnings
- **Active Bookings**: Confirmed bookings for upcoming trips
- **Pending Bookings**: Awaiting approval
- **Total Trips**: Published trips count
- **Recent Bookings**: Last 5 bookings (quick access)
- **Popular Trips**: Top 5 by booking count

**Quick Actions**:

- Create New Trip
- View All Bookings
- Manage Users
- Analytics

---

## 🏔️ Managing Trips

### Trip Lifecycle

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED → IN_PROGRESS → COMPLETED → ARCHIVED
```

### Creating a New Trip

1. **Go to Trips Section**
   - Admin Dashboard → "Trips" → "Create Trip"

2. **Basic Information**
   - **Title**: Catchy trip name (e.g., "Manali Snow Trek")
   - **Slug**: Auto-generated from title, used in URL
   - **Category**: Trek, Camping, Corporate, etc.
   - **Description**: Detailed overview (supports rich text)
   - **Highlights**: Key features (bullet points)

3. **Pricing & Duration**
   - **Price**: Per person cost (in INR)
   - **Duration**: Number of days
   - **Max Group Size**: Maximum participants

4. **Difficulty & Dates**
   - **Difficulty**: Easy, Moderate, Challenging, Extreme
   - **Start Date**: Trip departure
   - **End Date**: Trip return
   - **Batch Dates** (if multiple): Add additional departure dates

5. **Itinerary**
   - Click "Add Day"
   - Enter day number, title, and activities
   - Add as many days as trip duration
   - Use rich text editor for detailed descriptions

6. **Inclusions & Exclusions**
   - **Inclusions**: What's covered (meals, stay, transport, guide)
   - **Exclusions**: What's NOT covered (insurance, personal expenses)

7. **Images**
   - **Cover Image**: Main trip thumbnail (required)
   - **Hero Image**: Large banner image (optional)
   - **Gallery**: Multiple trip photos (optional)
   - Click "Upload" → Select from Media Library or upload new

8. **FAQs** (Optional)
   - Add common questions and answers
   - Example: "What fitness level is required?"

9. **Team Assignment**
   - **Manager**: Assign a Trip Manager
   - **Guides**: Assign one or more Trip Guides
   - Only users with appropriate roles appear in dropdown

10. **Save**
    - **Save as Draft**: Not visible to users, continue editing later
    - **Submit for Review**: Sends to Admin for approval
    - **Publish**: Immediately live on website (requires permission)

### Editing a Trip

1. Go to "Trips" → "All Trips"
2. Find trip (use search/filter)
3. Click "Edit"
4. Modify any field
5. Click "Save Changes"

**Note**: Editing published trips with active bookings? Be cautious! Price changes won't affect existing bookings.

### Trip States & Transitions

#### DRAFT

- **Who Can Set**: Creator
- **Visibility**: Hidden from public
- **Actions**: Edit, Submit for Review, Delete

#### PENDING_REVIEW

- **Who Can Set**: Trip Manager (after editing draft)
- **Visibility**: Hidden from public
- **Actions**: Approve, Reject, Edit

#### APPROVED

- **Who Can Set**: Admin (after review)
- **Visibility**: Still hidden
- **Actions**: Publish, Edit, Reject

#### PUBLISHED

- **Who Can Set**: Admin/Trip Manager
- **Visibility**: Public (appears in listings)
- **Actions**: Unpublish, Edit, Start Trip

#### IN_PROGRESS

- **Who Can Set**: System (automatically on start date) or Manual
- **Visibility**: Still listed but marked "In Progress"
- **Actions**: Complete Trip

#### COMPLETED

- **Who Can Set**: System (after end date) or Trip Manager
- **Visibility**: Public (users can review)
- **Actions**: Archive, Reopen

#### ARCHIVED

- **Who Can Set**: Admin
- **Visibility**: Hidden from public
- **Actions**: Restore, Delete

### Deleting a Trip

**⚠️ Warning**: Only delete trips with NO bookings!

1. Edit Trip
2. Scroll to bottom
3. Click "Delete Trip" (red button)
4. Confirm deletion

**If trip has bookings**:

- Archive instead of delete
- Contact Super Admin for force delete (requires manual booking handling)

### Bulk Actions

Select multiple trips (checkboxes):

- **Bulk Publish**: Publish selected drafts
- **Bulk Archive**: Archive selected trips
- **Export CSV**: Download trip data

---

## 📝 Managing Bookings

### Viewing Bookings

**All Bookings**:

- Admin Dashboard → "Bookings"
- View all bookings across all trips

**Trip-Specific Bookings**:

- Go to Trip → "View Bookings"
- See bookings for that specific trip only

**My Assigned Bookings** (Trip Guides):

- Dashboard → "My Trips" → Select Trip → "Bookings"

### Booking Details

Click any booking to see:

- **Booking ID**: Unique identifier
- **User**: Customer who booked
- **Trip**: Which trip
- **Guests**: Number and details of travelers
- **Total Amount**: Payment received
- **Payment Status**: Success, Failed, Pending
- **Booking Status**: Pending, Confirmed, Cancelled, etc.
- **Payment ID**: Razorpay transaction ID
- **Booked At**: Timestamp

### Booking Status Flow

```
Pending → Confirmed → In Progress → Completed
   ↓           ↓
Cancelled   Cancelled
   ↓
Refund Processed
```

### Approving a Booking

1. Open booking details
2. Verify payment received
3. Check guest details are complete
4. Click "Approve Booking"
5. Confirm action
6. User receives confirmation email

**When to Approve**:

- Payment successful
- Trip has available slots
- Guest information complete

### Rejecting a Booking

1. Open booking details
2. Select rejection reason:
   - Trip fully booked
   - Incomplete information
   - Payment issue
   - Other (specify)
3. Add optional note to customer
4. Click "Reject Booking"
5. Refund processed automatically (if paid)

### Cancelling a Booking

**User-Initiated**: Handled automatically via user dashboard

**Admin-Initiated**:

1. Open booking
2. Click "Cancel Booking"
3. Select reason:
   - Trip cancelled
   - User request
   - Force majeure
   - Other
4. Refund policy applied automatically
5. User notified via email

### Processing Refunds (Super Admin Only)

If automatic refund failed:

1. Go to Booking Details
2. Click "Process Refund"
3. Enter refund amount
4. Add reference note
5. Confirm
6. Manually process refund via Razorpay dashboard
7. Mark as complete

**Refund Timeline**:

- Initiated: Immediate
- Razorpay processing: 1-2 days
- Bank credit: 5-7 business days

### Bulk Booking Actions

- **Export Bookings**: Download CSV with filters
- **Send Reminder Email**: Remind users about upcoming trips
- **Bulk Approve**: Approve multiple pending bookings

---

## 👤 Managing Users

### Viewing Users

Admin Dashboard → "Users" → "All Users"

**User List Shows**:

- Name
- Email
- Roles
- Registration Date
- Last Login
- Account Status (Active/Suspended)

### User Details

Click any user to see:

- Profile information
- Assigned roles
- Booking history
- Total spent
- Reviews written
- Account activity

### Assigning Roles

1. Open user profile
2. Click "Manage Roles"
3. Select role(s) from dropdown:
   - Can assign multiple roles
   - **Warning**: Be cautious with ADMIN/SUPER_ADMIN
4. Click "Update Roles"

**Best Practices**:

- Don't assign unnecessary permissions
- Review role assignments quarterly
- Log all role changes (automatic)

### Editing User Information

Admins can edit:

- Name
- Phone number
- Address
- Preferences

**Cannot Edit**:

- Email (contact Super Admin)
- Password (user must reset)
- Booking history

### Suspending a User

If user violates terms:

1. Open user profile
2. Click "Suspend Account"
3. Enter reason
4. Select duration (temporary/permanent)
5. Confirm

**Effects**:

- User cannot login
- Active bookings remain valid
- Can be reactivated by admin

---

## 📝 Content Management

### Managing Blogs

**Access**: Admin Dashboard → "Content" → "Blogs"

#### Creating a Blog

1. Click "Create Blog"
2. **Title**: Catchy headline
3. **Slug**: Auto-generated URL
4. **Content**: Rich text editor
   - Add images
   - Format text (bold, italic, lists)
   - Embed videos
5. **Cover Image**: Select from library
6. **Category**: Travel Tips, Destination Guide, Stories, etc.
7. **Tags**: Add relevant keywords
8. **Status**:
   - **Draft**: Not public
   - **Published**: Live on website
9. **Save**

#### Blog Approval Workflow

1. Content writer creates blog (Draft)
2. Submits for review
3. Admin reviews content
4. Approves or Requests Changes
5. Once approved, blog is published

#### Blog Templates

Pre-made templates for common blog types:

- **Day-by-Day Journal**: Trip diary
- **Destination Guide**: Comprehensive guide
- **Travel Tips**: Advice article
- **Budget Breakdown**: Cost analysis

### Managing Hero Slides

**Homepage Carousel**: Admin Dashboard → "Content" → "Hero Slides"

#### Adding a Hero Slide

1. Click "Add Slide"
2. **Title**: Main heading (keep short)
3. **Subtitle**: Supporting text
4. **Image**: High-res banner (1920x800px recommended)
5. **CTA Button**:
   - Button Text (e.g., "Explore Now")
   - Link (e.g., /trips/slug or external URL)
6. **Order**: Slide position (1 = first)
7. **Active**: Toggle visibility
8. Save

#### Best Practices for Hero Slides

- Use 3-5 slides maximum
- Change seasonally (update for festivals, weather)
- Optimize images (compress to < 500KB)
- Test CTA links before publishing
- Review on mobile (responsive check)

### Managing FAQs

**Global FAQs**: Common questions across site

1. Content → FAQs
2. Add question and answer
3. Assign to category (General, Booking, Trips, etc.)
4. Set order
5. Publish

---

## 📁 Media Library

**Access**: Admin Dashboard → "Media"

### Uploading Media

1. Click "Upload"
2. Select files:
   - Images: JPG, PNG, WEBP, GIF
   - Max size: 5MB per file
   - Can upload multiple
3. Add metadata:
   - Alt text (for accessibility)
   - Caption
   - Tags
4. Upload

**Auto-Upload to Cloudinary**: Images stored on Cloudinary CDN for fast delivery

### Organizing Media

**Folders** (if implemented):

- trips/
- blogs/
- users/
- hero/

**Tags**: Add tags for easy searching

### Using Media

When adding images to trips/blogs:

1. Click "Select Image"
2. Media Library opens
3. Search/filter to find image
4. Click to select
5. Crop/adjust if needed
6. Insert

### Deleting Media

**⚠️ Warning**: Check if media is in use before deleting!

1. Select image
2. Click "Delete"
3. System checks for usage
4. If unused → Confirm deletion
5. If in use → Shows where it's used, confirm to proceed

---

## 📈 Analytics

**Access**: Admin Dashboard → "Analytics"

### Available Metrics

#### Revenue Analytics

- **Total Revenue**: All-time earnings
- **Revenue by Month**: Chart showing monthly trends
- **Revenue by Trip**: Which trips earn most
- **Average Booking Value**: Mean transaction size

#### Booking Analytics

- **Total Bookings**: Count by status
- **Booking Conversion Rate**: Visitors → Bookings
- **Popular Destinations**: Most booked trips
- **Booking Timeline**: When users book (how far in advance)

#### User Analytics

- **Total Users**: Registered count
- **New Users**: By period
- **User Retention**: Repeat booking rate
- **User Demographics**: Age, location (if collected)

#### Trip Analytics

- **Total Trips**: Published count
- **Trip Categories**: Distribution
- **Average Trip Rating**: Across all reviews
- **Occupancy Rate**: Booked slots / Total slots

### Exporting Data

1. Select date range
2. Choose metrics
3. Click "Export to CSV"
4. Use in Excel/Google Sheets for custom analysis

### Setting Goals

Track performance against targets:

- Revenue goals (monthly/quarterly)
- Booking targets
- Customer acquisition goals

---

## 📜 System Logs

**Access**: Admin Dashboard → "Logs" (Admin only)

### Audit Logs

Tracks sensitive actions:

- User role changes
- Booking approvals/cancellations
- Trip publishes/deletes
- Refund processing

**Log Entry Shows**:

- **Who**: User who performed action
- **What**: Action performed
- **When**: Timestamp
- **Resource**: Affected entity (trip, booking, user)
- **Details**: Additional context

### Filtering Logs

- **By User**: See all actions by specific admin
- **By Action**: Filter by type (CREATE, UPDATE, DELETE)
- **By Resource**: Trips, Bookings, Users
- **Date Range**: Specific time period

### Exporting Logs

For compliance or audits:

1. Set filters
2. Click "Export Logs"
3. CSV file downloads with all entries

---

## ✅ Best Practices

### Trip Management

- **Complete Information**: Fill all fields (itinerary, FAQs, images)
- **Accurate Pricing**: Double-check before publishing
- **Regular Updates**: Keep trip status current
- **Assign Team Early**: Add managers/guides before trip starts
- **Monitor Bookings**: Check daily for new bookings

### Booking Management

- **Quick Approvals**: Approve within 24 hours
- **Clear Communication**: Add notes when rejecting
- **Pre-Trip Contact**: Message guests 3-5 days before departure
- **Post-Trip Follow-up**: Request reviews after completion

### Content Quality

- **Professional Images**: High-res, well-framed photos
- **Proofread**: Check spelling and grammar
- **SEO Optimization**: Use relevant keywords in titles/descriptions
- **Regular Blog Posts**: Aim for 2-4 per month
- **Seasonal Content**: Update homepage slides regularly

### User Management

- **Role Audits**: Review permissions quarterly
- **Respond to Issues**: Handle user complaints promptly
- **Privacy Compliance**: Don't share user data
- **Account Security**: Use strong passwords, enable 2FA

### System Maintenance

- **Regular Backups**: (Automatic, but verify)
- **Monitor Errors**: Check Sentry daily
- **Update Content**: Keep FAQs, policies current
- **Test Features**: Periodically test booking flow

---

## ❓ FAQ

### General

**Q: I can't access a feature. Why?**  
A: Check your role permissions. Contact Admin if you need access.

**Q: Can I undo an action?**  
A: Some actions (like delete) are irreversible. Archive instead when possible.

**Q: How do I get support?**  
A: Email tech support or check internal documentation.

### Trips

**Q: Can I edit a trip with active bookings?**  
A: Yes, but be careful. Price changes won't affect existing bookings.

**Q: How do I feature a trip on homepage?**  
A: Edit trip → Toggle "Featured" → Save.

**Q: What if I need to cancel a published trip?**  
A: Change status to Cancelled, then manually cancel all bookings with full refund.

### Bookings

**Q: What if payment shows success but booking shows failed?**  
A: Check payment gateway dashboard. If paid, manually approve booking.

**Q: Can I modify booking details after approval?**  
A: Currently no. User must cancel and rebook.

**Q: How do I handle group booking inquiries?**  
A: Custom trips go through "Inquiries" section, not direct bookings.

### Users

**Q: Can I delete a user account?**  
A: Super Admin only. Archive/suspend instead if possible.

**Q: What if user forgets password and can't access email?**  
A: Verify identity, then manually reset password via admin panel.

---

## 📞 Admin Support

### Technical Issues

- **Email**: dev-support@paramadventures.com
- **Slack**: #admin-support channel
- **Phone**: +91-XXXX-XXXXXX (Emergency only)

### Training & Onboarding

New admins:

- Schedule onboarding call
- Review this guide thoroughly
- Shadow experienced admin for 1 week
- Complete checklist before independent work

---

## 🎯 Quick Reference

### Common Tasks

| Task            | Steps                                |
| --------------- | ------------------------------------ |
| Approve Booking | Bookings → Find → Approve            |
| Create Trip     | Trips → Create → Fill Form → Publish |
| Add Hero Slide  | Content → Hero → Add Slide           |
| Upload Image    | Media → Upload → Select File         |
| Assign Role     | Users → Find User → Manage Roles     |
| View Analytics  | Dashboard → Analytics                |

### Keyboard Shortcuts

- `Ctrl + K`: Quick search
- `Ctrl + N`: New trip (from trips page)
- `Ctrl + S`: Save (when editing)
- `Esc`: Close modal

---

**Last Updated**: January 2026  
**Version**: 1.0

For suggestions to improve this guide, contact: docs@paramadventures.com
