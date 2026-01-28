# E2E Testing Guide

## Overview

End-to-end tests validate the entire application flow from user perspective using Playwright. These tests run against real browsers and verify that all components work together correctly.

## Prerequisites

### Local Development

1. **Database**: PostgreSQL running with test data seeded
2. **Redis**: Redis server running on port 6379
3. **API Server**: Running on `http://localhost:3001`
4. **Web Server**: Running on `http://localhost:3000`

### First-Time Setup

```bash
# Install Playwright browsers
cd apps/e2e
npx playwright install chromium
```

## Running Tests

### Quick Start (Local)

```bash
# Use the helper script (checks prerequisites)
cd apps/e2e
pwsh ./run-e2e-local.ps1
```

### Manual Commands

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run in UI mode (interactive)
npm run test:ui

# Run in debug mode
npm run test:debug

# Generate new tests
npm run codegen
```

### View Reports

```bash
# Open HTML report
npx playwright show-report

# Reports are in: apps/e2e/playwright-report/
```

## Test Structure

```
apps/e2e/
├── tests/
│   ├── auth.spec.ts           # Authentication & signup
│   ├── trips.spec.ts           # Trip browsing & booking
│   ├── payments.spec.ts        # Payment flows
│   ├── admin.spec.ts           # Admin operations
│   ├── guides.spec.ts          # Guide management
│   ├── search.spec.ts          # Search & filters
│   └── wireframe-generator.spec.ts  # Screenshot generation
├── playwright.config.ts        # Playwright configuration
├── run-e2e-local.ps1          # Local test runner script
└── package.json
```

## CI/CD Integration

### GitHub Actions Workflow

E2E tests run automatically on:

- **Pull Requests**: All tests must pass before merge
- **Push to main**: Validates production readiness

### CI Environment Setup

The CI pipeline:

1. Spins up PostgreSQL and Redis containers
2. Builds API and Web applications
3. Runs database migrations
4. Seeds test data
5. Starts both servers in background
6. Runs E2E tests with retries
7. Uploads test reports and screenshots

### Viewing CI Test Results

- **Test Reports**: Available as artifacts in GitHub Actions
- **Screenshots**: Uploaded on test failures (7-day retention)
- **Videos**: Recorded on first retry (for debugging)

## Configuration

### Environment Variables

```bash
# CI Environment (GitHub Actions)
CI=true
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/param_adventures_test

# Local Development
# Uses .env from apps/api/.env
```

### Playwright Config Highlights

```typescript
{
  retries: CI ? 2 : 0,           // Retry failed tests in CI
  workers: CI ? 1 : 8,            // Sequential in CI, parallel locally
  timeout: 30000,                 // 30s per test
  reporter: CI ? ['html', 'github'] : 'html',
  video: 'retain-on-failure',     // Keep videos only on failures
}
```

## Test Patterns

### Authentication Tests

```typescript
test("should register a new user", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[placeholder="John Doe"]', "Test User");
  await page.fill('input[placeholder="name@example.com"]', "test@example.com");
  await page.fill(
    'input[placeholder="Create a strong password"]',
    "Password123!"
  );
  await page.click('button:has-text("Create Account")');

  // Wait for success message
  await expect(page.locator("text=Welcome Aboard")).toBeVisible();
});
```

### Booking Flow Tests

```typescript
test("should book a trip", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[placeholder="name@example.com"]', "user@example.com");
  await page.fill('input[placeholder="••••••••"]', "password");
  await page.click('button:has-text("Sign In")');

  // Book trip
  await page.goto("/trips");
  await page.click('a[href^="/trips/"]').first();
  await page.click('button:has-text("Join Trip")');

  // Fill booking form...
  await page.click('button:has-text("Confirm & Pay")');

  // Verify success
  await expect(page.getByText("Payment Successful")).toBeVisible();
});
```

## Common Issues & Solutions

### Issue: "Timeout waiting for locator"

**Cause**: Element not found or page loading slowly

**Solution**:

```typescript
// Increase timeout
await expect(element).toBeVisible({ timeout: 15000 });

// Wait for network to be idle
await page.waitForLoadState("networkidle");
```

### Issue: "Strict mode violation: resolved to 2 elements"

**Cause**: Multiple elements match the selector

**Solution**:

```typescript
// Use more specific selectors
await page.getByRole("button", { name: "Submit" }).first();
await page.locator('form button:has-text("Submit")').click();
```

### Issue: Tests pass locally but fail in CI

**Cause**: Timing differences, missing data, or environment issues

**Solution**:

- Add explicit waits for async operations
- Seed required test data in `beforeAll` hooks
- Use `test.slow()` for known slow tests
- Check CI logs for specific error messages

### Issue: Servers not running

**Solution**:

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev

# Terminal 3 - Tests
cd apps/e2e
npm test
```

## Best Practices

### ✅ Do's

- Use `getByRole()` for better accessibility testing
- Add `test.slow()` for tests that need more time
- Use `beforeAll` for test data setup
- Wait for elements to be visible before interaction
- Use meaningful test descriptions
- Group related tests with `test.describe()`

### ❌ Don'ts

- Don't use hardcoded `sleep()` - use proper waits
- Don't rely on text content that might change
- Don't create flaky tests with race conditions
- Don't skip cleanup in `afterEach/afterAll`
- Don't use production credentials in tests

## Test Coverage

Current test suites cover:

- ✅ **Authentication**: Login, signup, logout, session management
- ✅ **Trip Management**: Browse, search, filter, view details
- ✅ **Booking Flow**: Select trip, fill details, payment simulation
- ✅ **User Dashboard**: View bookings, edit profile, manage wishlist
- ✅ **Admin Operations**: Create trips, manage users, view analytics
- ✅ **Guide Features**: View assigned trips, manage profile
- ✅ **Search & Filters**: Location, price, difficulty, category
- ✅ **Wireframes**: Automated screenshot generation for all pages

## Debugging Tips

### Interactive Debugging

```bash
# Run in UI mode for step-by-step execution
npx playwright test --ui

# Run specific test in debug mode
npx playwright test tests/auth.spec.ts --debug

# Record new test with Codegen
npx playwright codegen http://localhost:3000
```

### Inspect Failed Tests

```bash
# View HTML report with screenshots
npx playwright show-report

# Check test-results/ folder for:
# - Screenshots (on failure)
# - Videos (on retry)
# - Traces (for replay)
```

### Trace Viewer

```bash
# If trace is enabled, view it with:
npx playwright show-trace test-results/.../trace.zip
```

## Performance Optimization

### Parallel Execution

```bash
# Run with specific number of workers
npx playwright test --workers=4

# Run sequentially (useful for debugging)
npx playwright test --workers=1
```

### Test Sharding

```bash
# Split tests across multiple CI jobs
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

## Maintenance

### Updating Tests

When application changes:

1. Update selectors if UI changes
2. Adjust timeouts if performance changes
3. Update test data if schema changes
4. Regenerate screenshots if design changes

### Regular Tasks

- Review and fix flaky tests
- Update Playwright version monthly
- Review test coverage gaps
- Optimize slow tests
- Clean up old test artifacts

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For issues:

1. Check this guide for common solutions
2. Review CI logs for error details
3. Check Playwright reports for screenshots
4. Run locally with `--debug` flag
5. Contact the development team

---

**Last Updated**: January 2026
