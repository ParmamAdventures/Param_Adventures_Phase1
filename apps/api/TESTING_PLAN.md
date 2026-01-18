# Testing Plan for Refactored Trip Controllers

## 🎯 Endpoints to Test

All endpoints are at: `http://localhost:3000/api/trips`

### Prerequisites
1. **Start the API server:** `npm run dev` in `apps/api`
2. **Have valid auth token:** Login first to get JWT token
3. **Have a test trip ID:** Create or use existing trip

---

## 📋 Test Cases

### 1. Submit Trip (POST /api/trips/:id/submit)
**Purpose:** Moves trip from DRAFT to PENDING_REVIEW

**Request:**
```bash
POST /api/trips/{tripId}/submit
Headers:
  Authorization: Bearer {your-jwt-token}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip status changes to PENDING_REVIEW
- ✅ Audit log created with action "TRIP_SUBMITTED"
- ✅ Error if trip not in DRAFT status
- ✅ State machine validation error if invalid transition

**Test Scenarios:**
- [ ] Submit valid DRAFT trip → Success
- [ ] Submit already PENDING_REVIEW trip → Error (invalid transition)
- [ ] Submit non-existent trip → 404 error
- [ ] Submit without permission → 403 error

---

### 2. Approve Trip (POST /api/trips/:id/approve)
**Purpose:** Moves trip from PENDING_REVIEW to APPROVED

**Request:**
```bash
POST /api/trips/{tripId}/approve
Headers:
  Authorization: Bearer {admin-jwt-token}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip status changes to APPROVED
- ✅ `approvedById` set to current user
- ✅ Audit log created
- ✅ Error if not PENDING_REVIEW

**Test Scenarios:**
- [ ] Approve valid PENDING_REVIEW trip → Success
- [ ] Approve DRAFT trip → Error
- [ ] Approve as non-admin → 403 error

---

### 3. Publish Trip (POST /api/trips/:id/publish)
**Purpose:** Moves trip from APPROVED to PUBLISHED

**Request:**
```bash
POST /api/trips/{tripId}/publish
Headers:
  Authorization: Bearer {admin-jwt-token}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip status changes to PUBLISHED
- ✅ `publishedAt` timestamp set
- ✅ Audit log created
- ✅ Error if not APPROVED

**Test Scenarios:**
- [ ] Publish valid APPROVED trip → Success
- [ ] Publish DRAFT trip → Error
- [ ] Published trip visible on frontend

---

### 4. Archive Trip (POST /api/trips/:id/archive)
**Purpose:** Moves trip from PUBLISHED to ARCHIVED

**Request:**
```bash
POST /api/trips/{tripId}/archive
Headers:
  Authorization: Bearer {admin-jwt-token}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip status changes to ARCHIVED
- ✅ Audit log created
- ✅ Error if not PUBLISHED

**Test Scenarios:**
- [ ] Archive PUBLISHED trip → Success
- [ ] Archive DRAFT trip → Error (invalid transition)
- [ ] Archived trip not visible on frontend

---

### 5. Restore Trip (POST /api/trips/:id/restore)
**Purpose:** Moves trip from ARCHIVED back to DRAFT

**Request:**
```bash
POST /api/trips/{tripId}/restore
Headers:
  Authorization: Bearer {admin-jwt-token}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip status changes to DRAFT
- ✅ Audit log created
- ✅ Error if not ARCHIVED

**Test Scenarios:**
- [ ] Restore ARCHIVED trip → Success
- [ ] Restore PUBLISHED trip → Error
- [ ] Restored trip editable again

---

### 6. Create Trip (POST /api/trips)
**Purpose:** Create new trip in DRAFT status

**Request:**
```bash
POST /api/trips
Headers:
  Authorization: Bearer {your-jwt-token}
  Content-Type: application/json
Body:
{
  "title": "Test Mountain Trek",
  "slug": "test-mountain-trek",
  "description": "A test trip for validation",
  "durationDays": 5,
  "difficulty": "MODERATE",
  "location": "Himalayas",
  "price": 15000,
  "category": "TREKKING",
  "capacity": 10
}
```

**Expected Results:**
- ✅ Status 201
- ✅ Trip created with status DRAFT
- ✅ Audit log created with action "TRIP_CREATED"
- ✅ Returns trip with `coverImage` and `gallery` included (TripIncludes.withMedia)
- ✅ `createdById` set to current user

**Test Scenarios:**
- [ ] Create valid trip → Success
- [ ] Create without required fields → 400 error
- [ ] Verify audit log in database

---

### 7. Update Trip (PUT /api/trips/:id)
**Purpose:** Update trip details

**Request:**
```bash
PUT /api/trips/{tripId}
Headers:
  Authorization: Bearer {your-jwt-token}
  Content-Type: application/json
Body:
{
  "title": "Updated Title",
  "price": 20000,
  ...other fields
}
```

**Expected Results:**
- ✅ Status 200
- ✅ Trip updated with new data
- ✅ Audit log created with action "TRIP_UPDATED"
- ✅ Returns trip with media includes
- ✅ Cache invalidated (via TripCacheService)
- ✅ Error if not owner and not admin
- ✅ Error if not DRAFT and not admin

**Test Scenarios:**
- [ ] Update own DRAFT trip → Success
- [ ] Update own PUBLISHED trip as non-admin → Error
- [ ] Update any trip as admin → Success
- [ ] Update someone else's trip → Error

---

## 🧪 Automated Test Script

Create `test-trip-endpoints.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let testTripId = '';

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@example.com',
    password: 'your-password',
  });
  authToken = response.data.data.token;
  console.log('✅ Logged in successfully');
}

async function createTrip() {
  const response = await axios.post(
    `${API_URL}/trips`,
    {
      title: 'Test Trip for Validation',
      slug: 'test-trip-validation-' + Date.now(),
      description: 'Testing refactored controllers',
      durationDays: 5,
      difficulty: 'MODERATE',
      location: 'Test Location',
      price: 10000,
      category: 'TREKKING',
      capacity: 10,
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  testTripId = response.data.data.id;
  console.log(`✅ Created trip: ${testTripId}`);
}

async function submitTrip() {
  const response = await axios.post(
    `${API_URL}/trips/${testTripId}/submit`,
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✅ Submitted trip (status: ${response.data.data.status})`);
}

async function approveTrip() {
  const response = await axios.post(
    `${API_URL}/trips/${testTripId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✅ Approved trip (status: ${response.data.data.status})`);
}

async function publishTrip() {
  const response = await axios.post(
    `${API_URL}/trips/${testTripId}/publish`,
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✅ Published trip (status: ${response.data.data.status})`);
}

async function archiveTrip() {
  const response = await axios.post(
    `${API_URL}/trips/${testTripId}/archive`,
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✅ Archived trip (status: ${response.data.data.status})`);
}

async function restoreTrip() {
  const response = await axios.post(
    `${API_URL}/trips/${testTripId}/restore`,
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✅ Restored trip (status: ${response.data.data.status})`);
}

async function testWorkflow() {
  try {
    console.log('\n🧪 Testing Trip Workflow...\n');
    
    await login();
    await createTrip();
    await submitTrip();
    await approveTrip();
    await publishTrip();
    await archiveTrip();
    await restoreTrip();
    
    console.log('\n🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWorkflow();
```

**Run:** `node test-trip-endpoints.js`

---

## ✅ Manual Testing Checklist

### TypeScript Compilation
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors in IDE
- [ ] All imports resolve correctly

### Server Startup
- [ ] `npm run dev` starts successfully
- [ ] No runtime errors in console
- [ ] All routes registered

### State Machine Validation
- [ ] Valid transitions work (DRAFT → PENDING_REVIEW)
- [ ] Invalid transitions rejected (DRAFT → COMPLETED)
- [ ] Error messages are descriptive

### Audit Logs
- [ ] Check database for audit logs after each action
- [ ] Verify action names are correct (no typos)
- [ ] Verify targetType is "TRIP"
- [ ] Verify metadata includes status

### Error Handling
- [ ] 404 for non-existent trips
- [ ] 403 for permission errors
- [ ] 400 for invalid state transitions
- [ ] Error messages use centralized constants

### Data Consistency
- [ ] Trip includes have coverImage and gallery
- [ ] publishedAt timestamp set on publish
- [ ] approvedById set on approve
- [ ] Cache invalidated on update

---

## 🔍 Database Verification

Check audit logs:
```sql
SELECT * FROM "AuditLog" 
WHERE "targetType" = 'TRIP' 
AND "targetId" = 'your-trip-id'
ORDER BY "createdAt" DESC;
```

Expected actions:
- TRIP_CREATED
- TRIP_SUBMITTED
- TRIP_APPROVED
- TRIP_PUBLISHED
- TRIP_ARCHIVED
- TRIP_RESTORED
- TRIP_UPDATED

---

## 🐛 Common Issues to Check

1. **Import Errors:** Verify all utility imports work
2. **Type Mismatches:** Ensure enum values match database
3. **Permission Checks:** Verify middleware runs correctly
4. **Cache Issues:** Ensure TripCacheService invalidation works
5. **State Machine:** Test all valid and invalid transitions

---

## ✅ Success Criteria

- [ ] All 7 controllers compile without errors
- [ ] Server starts successfully
- [ ] All valid transitions work
- [ ] Invalid transitions are rejected with proper errors
- [ ] Audit logs created correctly
- [ ] Error messages are consistent
- [ ] No magic strings in code
- [ ] TypeScript autocomplete works for constants

---

**Next Steps After Testing:**
1. If all tests pass → Continue migrating admin controllers
2. If issues found → Fix and re-test
3. Document any edge cases discovered
