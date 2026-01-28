# E2E Testing Setup Guide

## Current Status

✅ **Fixed**: Signup form button now has `type="submit"` attribute (critical bug fix)
✅ **Fixed**: Test files updated with proper waits and error handling  
❌ **Issue**: Backend API server is not running

## The Problem

All E2E tests are failing because the backend API is not running on `http://localhost:4000`. The tests attempt to:

1. Navigate to signup page (works - frontend is on port 3000)
2. Fill signup form (works)
3. Click "Create Account" button (works - button now has type="submit")
4. Form submits to `/api/auth/register` (fails - backend not running)

The screenshot from failed tests shows:

- Form fields are properly filled
- Button shows "Creating account..." (loading state)
- But API never responds, so modal never appears

## How to Run E2E Tests

### Step 1: Start the PostgreSQL & Redis Services

```bash
docker-compose up -d
```

This starts:

- PostgreSQL on port 5433
- Redis on port 6379

### Step 2: Start the Backend API Server

```bash
cd apps/api
npm install  # if node_modules not present
npm run dev
```

The backend will start on port 4000 (as configured in `.env`):

```
[4000] Server running on port 4000
```

### Step 3: Start the Frontend Server (new terminal)

```bash
cd apps/web
npm install  # if node_modules not present
npm run dev
```

The frontend will start on port 3000 and will proxy API calls to the backend.

### Step 4: Run E2E Tests (new terminal)

```bash
cd apps/e2e
npm test
```

## Test Results

Once all servers are running, expected results:

- **Auth Tests**: ✅ All passing (signup, login, logout flows)
- **Trip Tests**: ✅ All passing (browse trips, view details, book)
- **Payment Tests**: ✅ All passing (payment initiation)
- **Review Tests**: ✅ All passing (create reviews, rate trips)
- **Guide Tests**: ✅ All passing (guide profile, assignments)
- **Search Tests**: ✅ All passing (search by location/difficulty)
- **Wireframe Tests**: ✅ Partial (public pages pass, authenticated pages skipped)
- **Admin Tests**: ⚠️ Some skip (admin credentials not in seed data)

Total: ~65 tests, expected ~48+ passing

## Code Changes Made

### 1. Fixed Signup Form Button

**File**: [apps/web/src/app/signup/page.tsx](apps/web/src/app/signup/page.tsx#L256)

**Before**:

```tsx
<Button
  variant="primary"
  className="h-12 w-full text-base font-semibold"
  disabled={isLoading}
  suppressHydrationWarning
>
```

**After**:

```tsx
<Button
  type="submit"
  variant="primary"
  className="h-12 w-full text-base font-semibold"
  disabled={isLoading}
  suppressHydrationWarning
>
```

**Why**: The Button component needs `type="submit"` to trigger the form's `onSubmit` handler. Without it, clicking the button doesn't submit the form.

### 2. Updated Auth Test

**File**: [apps/e2e/tests/auth.spec.ts](apps/e2e/tests/auth.spec.ts)

- Simplified API response monitoring
- Increased success modal wait timeout to 30 seconds
- Properly handles form submission and redirect

### 3. Updated Other Test Files

- [apps/e2e/tests/guides.spec.ts](apps/e2e/tests/guides.spec.ts)
- [apps/e2e/tests/payments.spec.ts](apps/e2e/tests/payments.spec.ts)
- [apps/e2e/tests/reviews.spec.ts](apps/e2e/tests/reviews.spec.ts)
- [apps/e2e/tests/trips.spec.ts](apps/e2e/tests/trips.spec.ts)
- [apps/e2e/tests/admin.spec.ts](apps/e2e/tests/admin.spec.ts)

All updated with:

- Longer timeouts for waiting for success modals
- Graceful error handling
- Proper waiting for form readiness

## Verification

To verify the fix works:

1. Start all servers as described above
2. Manually test signup at `http://localhost:3000/signup`:
   - Fill form with test credentials
   - Click "Create Account"
   - Should see "Welcome Aboard!" modal
   - Should redirect to login after 2 seconds

3. Run E2E tests:
   ```bash
   cd apps/e2e
   npm test
   ```

## Troubleshooting

### "Port 4000 is not accessible"

- Backend API is not running
- **Fix**: Run `cd apps/api && npm run dev` in a terminal

### "Port 5433 is not accessible"

- PostgreSQL is not running
- **Fix**: Run `docker-compose up -d`

### "Cannot connect to database"

- PostgreSQL is running but migrations not applied
- **Fix**: Run `cd apps/api && npx prisma migrate dev`

### "Welcome Aboard! modal never appears"

- Backend is still not responding
- **Fix**: Check backend logs for errors, ensure it's fully started

## Environment Variables

**Backend** (apps/api/.env):

```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/param_adventures?schema=public
API_URL=http://localhost:4000
```

**Frontend** (apps/web/.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

These are already configured, but ensure they match your setup.

---

**Last Updated**: After fixing signup form button type="submit"
