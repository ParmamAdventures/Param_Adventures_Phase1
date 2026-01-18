# Quick Manual Testing Guide for Batch 1

## Prerequisites
✅ Server running on `localhost:3000`  
✅ Prisma Studio open (check database)  
✅ Thunder Client/Postman ready

---

## Step 1: Login & Get Token

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@paramadventures.com",
  "password": "Admin@123"
}
```

**Copy the token** from response!

---

## Step 2: Test Trip Workflow (7 Endpoints)

### 2.1 Create Trip
```http
POST http://localhost:3000/api/trips
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Test Trek {{$timestamp}}",
  "slug": "test-trek-{{$timestamp}}",
  "description": "Testing refactored controllers",
  "durationDays": 5,
  "difficulty": "MODERATE",
  "location": "Test Mountains",
  "price": 15000,
  "category": "TREKKING",
  "capacity": 10,
  "itinerary": "Day 1-5: Adventure"
}
```
**✅ Check:** Response includes trip with `coverImage` and `gallery` (TripIncludes.withMedia)

### 2.2 Submit Trip (DRAFT → PENDING_REVIEW)
```http
POST http://localhost:3000/api/trips/{{tripId}}/submit
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status changes to `PENDING_REVIEW`

### 2.3 Approve Trip (PENDING_REVIEW → APPROVED)
```http
POST http://localhost:3000/api/trips/{{tripId}}/approve
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status = `APPROVED`, `approvedById` is set

### 2.4 Publish Trip (APPROVED → PUBLISHED)
```http
POST http://localhost:3000/api/trips/{{tripId}}/publish
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status = `PUBLISHED`, `publishedAt` timestamp exists

### 2.5 Archive Trip (PUBLISHED → ARCHIVED)
```http
POST http://localhost:3000/api/trips/{{tripId}}/archive
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status = `ARCHIVED`

### 2.6 Restore Trip (ARCHIVED → DRAFT)
```http
POST http://localhost:3000/api/trips/{{tripId}}/restore
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status = `DRAFT`

### 2.7 Update Trip
```http
PUT http://localhost:3000/api/trips/{{tripId}}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 20000
}
```
**✅ Check:** Changes applied, response includes media

---

## Step 3: Test Admin Endpoints (3 Controllers)

### 3.1 Update User Status
```http
PUT http://localhost:3000/api/admin/users/{{userId}}/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "SUSPENDED",
  "reason": "Testing"
}
```
**✅ Check:** User status updated

### 3.2 Assign Role
```http
POST http://localhost:3000/api/admin/roles/assign
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "userId": "{{userId}}",
  "roleName": "GUIDE"
}
```
**✅ Check:** Role assigned

### 3.3 Unsuspend User
```http
PUT http://localhost:3000/api/admin/users/{{userId}}/unsuspend
Authorization: Bearer YOUR_TOKEN
```
**✅ Check:** Status = `ACTIVE`

---

## Step 4: Verify Audit Logs

Open Prisma Studio → AuditLog table

**Expected Entries:**
- `TRIP_CREATED`
- `TRIP_SUBMITTED`
- `TRIP_APPROVED`
- `TRIP_PUBLISHED`
- `TRIP_ARCHIVED`
- `TRIP_RESTORED`
- `TRIP_UPDATED`
- `USER_STATUS_CHANGED` (2x)
- `USER_ROLE_ASSIGNED`

**✅ All actions should be type-safe constants** (no typos!)

---

## Step 5: Test State Machine

Try an **invalid transition:**

```http
POST http://localhost:3000/api/trips/{{draftTripId}}/archive
Authorization: Bearer YOUR_TOKEN
```

**✅ Expected:** Error `INVALID_STATUS_TRANSITION`  
**✅ Message:** Should list allowed transitions

---

## Quick Checklist

- [ ] Login works
- [ ] Create trip works (shows media includes)
- [ ] Submit trip (DRAFT → PENDING_REVIEW)
- [ ] Approve trip (PENDING_REVIEW → APPROVED)
- [ ] Publish trip (APPROVED → PUBLISHED)
- [ ] Archive trip (PUBLISHED → ARCHIVED)
- [ ] Restore trip (ARCHIVED → DRAFT)
- [ ] Update trip works
- [ ] User status update works
- [ ] Role assignment works
- [ ] Audit logs created correctly
- [ ] Invalid transitions blocked
- [ ] Error messages consistent

---

## 🎯 Success = All ✅ Checks Pass

If all tests pass → **Batch 1 is production-ready!** 🎉
