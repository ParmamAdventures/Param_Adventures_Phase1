# Roles & Permissions — Param Adventures

This document defines the Access Control logic for the Param Adventures platform. It serves as the definitive source of truth for the Backend (`seed.js`, `middleware`) and Frontend (`Navbar`, `Badges`).

---

## 🎭 Role Definitions

### 1. SUPER ADMIN (`SUPER_ADMIN`)
**The System Owner.**
- **Powers**: Absolute authority. Can delete users, promote roles, and override any system guard.
- **Exclusivity**: Limited to 2-3 trusted administrators.

### 2. ADMIN (`ADMIN`)
**The Operational Head.**
- **Core Responsibility**: High-level moderation and content management.
- **Powers**:
  - **User Mgmt**: Can suspend users (with reason).
  - **Content**: Create/Publish trips and moderate blog posts.
  - **Logistics**: Assign **Trip Managers** to expeditions.

### 3. TRIP MANAGER (`TRIP_MANAGER`)
**The Mission Commander.** (Assigned per trip by Admin).
- **Preparation**: Coordinates guest lists and receives user documentation.
- **Coordination**: Assigns **Trip Guides** to the expedition.
- **Completion**: Closes the trip lifecycle by triggering reviews after validating field documentation.

### 4. TRIP GUIDE (`TRIP_GUIDE`)
**The Field Captain.** (Assigned by Manager).
- **Execution**: Leads the physical expedition.
- **Verification**: Responsible for uploading field documentation (bills, proofs, photos) to the platform.
- **Closure**: Marks the trip as "Physically Completed".

### 5. UPLOADER (`UPLOADER`)
**The Content Specialist.**
- **Responsibility**: Maintains high-quality trip data, itineraries, and gallery images.
- **Access**: Can create "Draft" content but cannot publish without Admin approval.

### 6. USER (`USER`)
**The Traveler.**
- **Lifecycle**: Books trips, receives guide info, completes the journey, and unlocks digital badges after submitting a review.

---

## 🔒 Permission Matrix

| Feature | SUPER ADMIN | ADMIN | MANAGER | GUIDE | USER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Delete User** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Publish Trip** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Assign Guide** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Upload Docs** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Close Trip** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🔄 The Trip Lifecycle Workflow

1. **Setup**: Admin creates a Trip and assigns a **Trip Manager**.
2. **Resource Prep**: Manager prepares logistics and assigns **Trip Guides**.
3. **Execution**: The trip takes place in the field.
4. **Field Closure**: Guide marks trip "Ended" and uploads **Field Documentation**.
5. **Review Stage**: Manager validates documentation and triggers **Review Forms** to guests.
6. **Completion**: Once a guest reviews, the trip status is "Completed" for them, and a **Badge** is unlocked.

---

## 🛠️ Technical Implementation

### Frontend (Visual Indicators)
- 🛡️ **Blue Shield**: Admin
- 💼 **Purple Briefcase**: Manager
- 🧭 **Green Compass**: Guide
- ☁️ **Orange Cloud**: Uploader

### Backend Implementation
- **Middleware**: `permission.middleware.ts` verifies `user.roles` -> `role.permissions`.
- **Seeding**: `prisma/seed.js` maps production-ready permission keys to each role.
