# E2E Testing - Local Development Guide

This guide explains how to run E2E tests locally. **E2E tests are NOT run in CI/CD** to maintain fast, reliable build pipelines. Instead, they are meant for local development and validation.

## Quick Start

### 1. Prerequisites
Ensure you have:
- Node.js 18+ installed
- Both API and Web servers running locally
- Playwright browsers installed

### 2. Install Playwright Browsers
```bash
cd apps/e2e
npx playwright install --with-deps chromium
```

### 3. Start the Application Stack Locally

**Option A: Using existing local setup**
```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web
cd apps/web
npm run dev
```

**Option B: Using Docker (if configured)**
```bash
docker-compose up -d
```

### 4. Seed Test Database
```bash
cd apps/api
node prisma/seeds/test/seed_comprehensive.mjs
```

### 5. Run E2E Tests

**Run all tests:**
```bash
cd apps/e2e
npm test
```

**Run specific test file:**
```bash
npm test -- tests/auth.spec.ts
npm test -- tests/trips.spec.ts
```

**Run tests in headed mode (see browser):**
```bash
npm test:headed
```

**Run tests in UI mode (interactive):**
```bash
npm test:ui
```

**Run tests in debug mode:**
```bash
npm test:debug
```

## Available Test Suites

✅ **Stable & Ready:**
- `auth.spec.ts` - Registration, login, authentication flows
- `trips.spec.ts` - Trip listing, filtering, viewing
- `search.spec.ts` - Global search functionality
- `payments.spec.ts` - Payment processing
- `reviews.spec.ts` - Review creation and management
- `guides.spec.ts` - Trip guides and information
- `blogs.spec.ts` - Blog creation and viewing
- `admin.spec.ts` - Admin dashboard operations
- `wireframe-generator.spec.ts` - Wireframe generation

⏸️ **Temporarily Disabled (Work in Progress):**
- `profile.spec.ts.skip` - User profile tests
- `bookings.spec.ts.skip` - Booking management
- `review-management.spec.ts.skip` - Review management

## Re-enabling Skipped Tests

To re-enable and work on skipped tests:

```bash
# Rename to remove .skip extension
mv apps/e2e/tests/profile.spec.ts.skip apps/e2e/tests/profile.spec.ts

# Then run and debug
npm test -- tests/profile.spec.ts --debug
```

## Environment Variables

Tests use these variables (from `playwright.config.ts`):
- `BASE_URL` - Web app URL (default: http://localhost:3000)
- `API_URL` - API URL (default: http://localhost:3001)
- `CI` - Set to "true" when running in CI environment

## Viewing Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

This opens the Playwright report showing:
- Test results and timing
- Screenshots on failure
- Video recordings
- Detailed error traces

## Debugging Failed Tests

### 1. Run with video recording:
```bash
npm test -- --video=on
```

### 2. Run specific test with headed browser:
```bash
npm test:headed -- -g "should register a new user"
```

### 3. Use Playwright Inspector:
```bash
npm test:debug
```

### 4. Check screenshots:
Failed tests save screenshots to `apps/e2e/test-results/`

## Common Issues

### Tests timing out
- Ensure API and Web servers are running
- Check that servers are listening on correct ports (3001, 3000)
- Increase timeout in `playwright.config.ts` if needed

### Authentication failures
- Verify seed database was run: `node prisma/seeds/test/seed_comprehensive.mjs`
- Check that API is connected to correct database
- Ensure test users exist in database

### Tests can't find elements
- Run in headed mode to see what's happening: `npm test:headed`
- Use `--debug` to pause and inspect the page
- Check selectors in test files match current UI

## Adding New Tests

1. Create new `.spec.ts` file in `apps/e2e/tests/`
2. Follow pattern from existing tests
3. Use `test.describe()` for grouping related tests
4. Use `test.beforeEach()` for common setup (like login)

Example:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    await page.goto("/path");
    await expect(page.getByText("Expected Text")).toBeVisible();
  });
});
```

## CI/CD Integration

**E2E tests are intentionally excluded from CI/CD** because:
- ✅ They require running servers (not available in GitHub Actions)
- ✅ They're better suited for local development and manual testing
- ✅ Unit tests (372) provide fast feedback in CI
- ✅ E2E tests can be flaky due to timing and environment differences

Future: Consider adding E2E tests to CI when:
- Test infrastructure is hardened
- All skipped tests are resolved and passing
- Mock/fixture-based testing is fully implemented
- Separate staging environment is available

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Config Guide](https://playwright.dev/docs/test-configuration)
- [Best Practices](https://playwright.dev/docs/best-practices)
