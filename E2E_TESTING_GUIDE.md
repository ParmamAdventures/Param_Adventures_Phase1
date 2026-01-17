# E2E Testing Guide - Param Adventures

## Overview

This project uses **Playwright** for End-to-End (E2E) testing. E2E tests verify the entire user workflow from UI to database.

## Setup

### Prerequisites

- ✅ Node.js installed
- ✅ Docker running (for services)
- ✅ Both API and Frontend servers running

### Installation

```bash
cd apps/e2e
npm install
```

## Running Tests

### Before Running Tests

**IMPORTANT:** Make sure both servers are running:

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Frontend
cd apps/web
npm run dev

# Terminal 3: Run tests
cd apps/e2e
npm test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Debug mode (step through each step)
npm run test:debug

# Generate new tests (codegen)
npm run codegen
```

## Available Test Suites

### 1. **Authentication Tests** (`auth.spec.ts`)

Tests user registration and login flows.

- **Register a new user** ✓
- **Login with existing credentials** ✓
- **Logout functionality** ✓
- **Password validation** ✓

**Test Credentials:**

```
Email: admin@test.com
Password: AdminPass123

Email: user1@test.com
Password: UserPass123
```

### 2. **Admin Operations** (`admin.spec.ts`)

Tests admin dashboard and management features.

- **Create a new trip** ✓
- **Edit trip details** ✓
- **Manage user status** ✓
- **View analytics** ✓
- **View bookings** ✓

**Admin Credential:**

```
Email: admin@test.com
Password: AdminPass123
```

### 3. **Trip Booking Flow** (`trips.spec.ts`)

Tests complete booking workflow.

- **Browse available trips** ✓
- **View trip details** ✓
- **Add trip to cart** ✓
- **Proceed to checkout** ✓
- **Complete booking** ✓
- **View booking confirmation** ✓

## Test Results

### Expected Outcomes

**All 6 tests should pass:**

```
  ✓ Authentication Flow › should register a new user
  ✓ Authentication Flow › should login with valid credentials
  ✓ Admin Operations › should create a new trip as admin
  ✓ Admin Operations › should manage user status
  ✓ Trip Booking Flow › should find and browse trips
  ✓ Trip Booking Flow › should find and book a trip
```

### HTML Report

After running tests, an HTML report is generated:

```
playwright-report/index.html
```

Open this file in your browser to see:

- Test results with screenshots
- Video recordings
- Detailed error messages
- Network requests

## Troubleshooting

### Connection Refused Error

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
```

**Solution:**
Make sure both servers are running:

```bash
# Check API is running
curl http://localhost:3001/

# Check Frontend is running
curl http://localhost:3000/
```

### Tests Timeout

If tests are slow or timeout:

1. Increase timeout in `playwright.config.ts`:

```typescript
timeout: 30000, // 30 seconds
```

2. Increase navigation timeout:

```typescript
navigationTimeout: 30000,
```

### Database Issues

If seeding fails or data is inconsistent:

```bash
# Reseed database
cd apps/api
npm run seed:dummy

# Check database
npx prisma studio
```

## Environment Configuration

Tests use environment variables from `.env` files:

**API (.env):**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/param_adventures
DIRECT_URL=postgresql://postgres:postgres@localhost:5433/param_adventures
```

**Frontend (.env.local):**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## CI/CD Integration

### GitHub Actions

Tests can be run in CI/CD pipeline:

```yaml
- name: Run E2E Tests
  run: |
    cd apps/e2e
    npm ci
    npm test
```

### Requirements for CI:

- Services must be started before tests
- Use `baseURL` instead of hardcoded localhost
- Screenshots/videos for debugging

## Best Practices

1. **Always start servers first**

   ```bash
   # Start all services with one script
   npm run dev  # from root
   ```

2. **Use meaningful test names**

   ```typescript
   test("should successfully book a trip and see confirmation", async ({
     page,
   }) => {
     // Test code
   });
   ```

3. **Wait for elements properly**

   ```typescript
   // Good
   await page.waitForSelector('button:has-text("Book Now")');

   // Avoid
   await page.click("button"); // Too generic
   ```

4. **Take screenshots on failure**

   ```typescript
   await page.screenshot({ path: "failure.png" });
   ```

5. **Clean up after tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.close();
   });
   ```

## Common Test Patterns

### Login Test

```typescript
test("should login successfully", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "admin@test.com");
  await page.fill('input[type="password"]', "AdminPass123");
  await page.click('button:has-text("Sign In")');
  await page.waitForURL("/dashboard");
});
```

### Form Submission Test

```typescript
test("should submit form with valid data", async ({ page }) => {
  await page.goto("/booking");
  await page.fill('input[name="email"]', "user@test.com");
  await page.fill('input[name="guests"]', "2");
  await page.click('button[type="submit"]');
  await page.waitForSelector(".success-message");
});
```

### API Intercept Test

```typescript
test("should handle API errors gracefully", async ({ page }) => {
  await page.route("**/api/**", (route) => route.abort("failed"));
  await page.goto("/");
  await page.waitForSelector(".error-message");
});
```

## Debugging Tips

### 1. UI Mode

```bash
npm run test:ui
```

Run tests in UI with:

- Live browser preview
- Step through each action
- Inspect elements

### 2. Debug Mode

```bash
npm run test:debug
```

Opens browser and debugger for each test.

### 3. Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```

Slows down actions by 1 second for visibility.

### 4. View HTML Report

```bash
npx playwright show-report
```

Opens the test report in browser.

## Next Steps

1. ✅ Run tests locally
2. ✅ Fix any failures
3. ✅ Add more test scenarios
4. ✅ Integrate with CI/CD
5. ✅ Set up visual regression testing

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Test Report](https://playwright.dev/docs/test-reporters)

---

**Status:** ✅ Ready for E2E Testing
**Last Updated:** January 17, 2026
