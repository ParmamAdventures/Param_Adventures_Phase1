
# Roles and Permissions Scoping

This document serves as the **Single Source of Truth** for the access control model in Param Adventures.
Based on the system configuration (`apps/api/prisma/seed.js`), the following Roles and Permissions are defined.

## Roles Overview

| Role | System Name | Description | scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `SUPER_ADMIN` | Full System Access (Root) | Infrastructure, Roles, Critical Data |
| **Administrator** | `ADMIN` | Operational Admin | Trip Mgmt, User Mgmt, Bookings, Content |
| **Uploader** | `UPLOADER` | Content Creator | Create Draft Trips, Upload Blogs/Media |
| **Trip Manager** | `TRIP_MANAGER` | Logistics Coordinator | Assign Guides, View internal trip details, Manage Bookings |
| **Trip Guide** | `TRIP_GUIDE` | Field Staff | View Guests, Update Trip Status, View Media |
| **User** | `USER` | Standard Traveler | Book Trips, Create Blogs (Draft), View own Profile |

---

## Permissions Matrix

### 1. Trip Management
| Permission | Description | SUPER_ADMIN | ADMIN | UPLOADER | MANAGER | GUIDE | USER |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `trip:create` | Create new trip drafts | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `trip:edit` | Edit trip details | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `trip:submit` | Submit trip for review | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `trip:approve` | Approve trip for publishing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `trip:publish` | Publish trip live | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `trip:archive` | Archive trip | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `trip:view:internal` | View Draft/Pending Trips | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `trip:update-status` | operational updates (started/ended) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `trip:assign-guide` | Assign guides/managers | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `trip:view:guests` | View guest list for trip | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

### 2. Booking Management
| Permission | Description | ADMIN | MANAGER | GUIDE | USER |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `booking:create` | Book a trip | ✅ | ❌ | ❌ | ✅ |
| `booking:view` | View own bookings | ✅ | ✅ | ❌ | ✅ |
| `booking:read:admin` | View ALL bookings | ✅ | ✅ | ❌ | ❌ |
| `booking:approve` | Manually approve booking | ✅ | ❌ | ❌ | ❌ |
| `booking:reject` | Reject booking | ✅ | ❌ | ❌ | ❌ |
| `booking:cancel` | Cancel booking | ✅ | ❌ | ❌ | ❌ |

### 3. Content (Blogs & Media)
| Permission | Description | ADMIN | UPLOADER | USER |
| :--- | :--- | :---: | :---: | :---: |
| `blog:create` | Draft a blog | ✅ | ✅ | ✅ |
| `blog:update` | Edit own blog | ✅ | ✅ | ✅ |
| `blog:submit` | Submit for review | ✅ | ✅ | ✅ |
| `blog:approve` | Approve/Reject Blogs | ✅ | ❌ | ❌ |
| `blog:publish` | Publish Blogs | ✅ | ❌ | ❌ |
| `media:upload` | Upload Images/Videos | ✅ | ✅ | ✅* |
| `media:view` | View Media Library | ✅ | ✅ | ❌ |

*\* Users can upload media only in context of Blog/Profile.*

### 4. System Administration
| Permission | Description | SUPER_ADMIN | ADMIN |
| :--- | :--- | :---: | :---: |
| `user:list` | List all users | ✅ | ✅ |
| `user:view` | View full profiles | ✅ | ✅ |
| `user:edit` | Edit user details | ✅ | ✅ |
| `user:assign-role` | Change user roles | ✅ | ✅ |
| `role:list` | View System Roles | ✅ | ✅ |
| `audit:view` | View Audit Logs | ✅ | ✅ |

---

## Workflow Examples

### 1. New Trip Creation
1. **Uploader** creates a Trip (`trip:create`). Status: `DRAFT`.
2. **Uploader** uploads media (`media:upload`).
3. **Uploader** fills itinerary and submits (`trip:submit`). Status: `PENDING_REVIEW`.
4. **Admin** receives notification (future feature).
5. **Admin** reviews trip (`trip:view:internal`).
6. **Admin** approves (`trip:approve`) and publishes (`trip:publish`). Status: `PUBLISHED`.
7. **Manager** is assigned to trip (`trip:assign-guide`).

### 2. User Blog Submission
1. **User** writes a blog (`blog:create`). Status: `DRAFT`.
2. **User** submits blog (`blog:submit`). Status: `PENDING_REVIEW`.
3. **Admin** reviews blog content.
4. **Admin** approves (`blog:approve`). Status: `PUBLISHED`.

---

## Technical Implementation
- **Source of Truth**: `apps/api/prisma/seed.js`
- **Middleware**: `requirePermission('permission:key')`
- **Frontend Logic**: `usePermission('permission:key')` hook.

