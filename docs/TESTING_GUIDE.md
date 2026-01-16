# Test Strategy & Implementation Guide - Param Adventures

Complete guide for implementing comprehensive test coverage across the platform.

**Current Coverage**: ~20%  
**Target Coverage**: 80%+  
**Priority**: Critical security & payment flows first

---

## 📋 Table of Contents

1. [Test Structure](#test-structure)
2. [Current Coverage Status](#current-coverage-status)
3. [Critical Bugs to Fix](#critical-bugs-to-fix)
4. [Test Implementation Plan](#test-implementation-plan)
5. [Testing Best Practices](#testing-best-practices)
6. [Test Templates](#test-templates)
7. [Running Tests](#running-tests)
8. [Coverage Reports](#coverage-reports)

---

## 🗂️ Test Structure

### Directory Layout

```
apps/api/
├── tests/
│   ├── unit/                    # Unit tests (services, utilities)
│   │   ├── auth.service.test.ts
│   │   ├── booking.service.test.ts
│   │   ├── trip.service.test.ts      # TO CREATE
│   │   ├── user.service.test.ts      # TO CREATE
│   │   ├── razorpay.service.test.ts  # TO CREATE (CRITICAL)
│   │   └── ...
│   │
│   ├── integration/             # API endpoint tests
│   │   ├── auth.test.ts
│   │   ├── booking.test.ts
│   │   ├── trips.test.ts             # TO CREATE
│   │   ├── payments.test.ts          # TO CREATE (CRITICAL)
│   │   ├── reviews.test.ts           # TO CREATE
│   │   ├── blogs.test.ts             # TO CREATE
│   │   └── ...
│   │
│   ├── fixtures/                # Test data
│   │   ├── trips.fixtures.ts
│   │   ├── bookings.fixtures.ts
│   │   └── users.fixtures.ts
│   │
│   ├── helpers/                 # Test utilities
│   │   ├── auth_helper.ts
│   │   ├── db_helper.ts              # TO CREATE
│   │   ├── mock_helper.ts            # TO CREATE
│   │   └── api_helper.ts             # TO CREATE
│   │
│   ├── setup.ts                # Global test setup
│   └── globalTeardown.ts       # Cleanup
│
apps/web/
└── e2e/                        # End-to-end tests
    ├── booking.spec.ts
    ├── trip-booking.spec.ts          # TO CREATE
    ├── admin-dashboard.spec.ts       # TO CREATE
    └── ...
```

---

## 📊 Current Coverage Status

### Services (8 total)

| Service                 | Unit Tests | Coverage | Priority        | Status                             |
| ----------------------- | ---------- | -------- | --------------- | ---------------------------------- |
| auth.service.ts         | ✅ Partial | 40%      | P0              | Add password reset, edge cases     |
| booking.service.ts      | ✅ Partial | 30%      | P0              | Add approval flow, capacity checks |
| **razorpay.service.ts** | ❌ None    | 0%       | **P0 CRITICAL** | **CREATE IMMEDIATELY**             |
| trip.service.ts         | ❌ None    | 0%       | P1              | Create full suite                  |
| user.service.ts         | ❌ None    | 0%       | P1              | Create full suite                  |
| notification.service.ts | ❌ None    | 0%       | P2              | Create tests                       |
| analytics.service.ts    | ❌ None    | 0%       | P2              | Create tests                       |
| audit.service.ts        | ❌ None    | 0%       | P3              | Low priority                       |

### Controllers (70+ total)

| Domain       | Controllers | Tested | Coverage | Priority |
| ------------ | ----------- | ------ | -------- | -------- |
| **Payments** | 6           | 0      | 0%       | **P0**   |
| **Bookings** | 7           | 3      | 43%      | P0       |
| Auth         | 1           | 1      | 60%      | P1       |
| **Trips**    | 14          | 1      | 7%       | P1       |
| Admin        | 12          | 2      | 17%      | P1       |
| Users        | 1           | 1      | 50%      | P1       |
| **Reviews**  | 3           | 0      | 0%       | P2       |
| **Blogs**    | 11          | 0      | 0%       | P2       |
| **Media**    | 8           | 0      | 0%       | P2       |
| Others       | 7+          | 1      | 14%      | P3       |

**Total**: ~12% controller coverage

---

## 🐛 Critical Bugs to Fix First

### Bug #1: Inconsistent Error Handling in Auth

**Location**: `apps/api/src/services/auth.service.ts` line ~23

**Current Code**:

```typescript
// Line 23 in register method
if (existingUser) {
  throw new Error("Email already registered");
}
```

**Problem**: Returns 500 instead of 409, breaks error handling

**Fix**:

```typescript
if (existingUser) {
  throw new HttpError(409, "EMAIL_REGISTERED", "Email already registered");
}
```

### Bug #2: Zod Error Handling

**Location**: `apps/api/src/middlewares/validate.middleware.ts` line ~20

**Current Code**:

```typescript
const formattedErrors = error.errors.map(err => ({ ... }));
```

**Problem**: Zod uses `.issues` not `.errors`

**Fix**:

```typescript
const formattedErrors = error.issues.map(err => ({ ... }));
```

### Bug #3: Queue Mock Issue

**Location**: `apps/api/tests/integration/booking.test.ts`

**Problem**: Mock doesn't implement `.close()` method

**Fix**: Add proper mock in setup or use actual implementation

### Bug #4: Response Structure Inconsistency

**Location**: Various controllers

**Problem**: Some return `{data: resource}`, others `{data: {resource: ...}}`

**Fix**: Standardize to `ApiResponse.success(res, message, data)` format

---

## 📅 Test Implementation Plan

### Phase 1: Fix Critical Issues (Days 1-2)

**Day 1: Bug Fixes**

- [ ] Fix Bug #1: Auth error handling
- [ ] Fix Bug #2: Zod error handling
- [ ] Fix Bug #3: Queue mock
- [ ] Fix Bug #4: Response structure
- [ ] Run all existing tests to verify fixes

**Day 2: Test Infrastructure**

- [ ] Create test fixtures directory structure
- [ ] Create common test helpers
- [ ] Set up coverage reporting
- [ ] Create test data factories

### Phase 2: Critical Security Tests (Week 1)

**Priority 0: Payment System** (Days 3-5)

```
apps/api/tests/unit/razorpay.service.test.ts
apps/api/tests/integration/payments.test.ts
```

- [ ] Test order creation
- [ ] Test signature verification (security critical!)
- [ ] Test webhook handler
- [ ] Test refund processing
- [ ] Test invalid signature handling
- [ ] Test replay attack prevention

**Priority 0: Booking Approval** (Days 6-7)

```
apps/api/tests/integration/booking-approval.test.ts
apps/api/tests/unit/booking.service.test.ts (expand)
```

- [ ] Test approval workflow
- [ ] Test rejection with refund
- [ ] Test capacity validation
- [ ] Test concurrent booking conflicts
- [ ] Test state transitions

### Phase 3: Core Services (Week 2)

**Trip Service** (Days 8-10)

```
apps/api/tests/unit/trip.service.test.ts
apps/api/tests/integration/trips.test.ts
```

- [ ] CRUD operations
- [ ] State machine transitions
- [ ] Capacity management
- [ ] Gallery/media handling
- [ ] Manager/guide assignment

**User Service** (Days 11-12)

```
apps/api/tests/unit/user.service.test.ts
apps/api/tests/integration/users.test.ts
```

- [ ] Permission checking
- [ ] Role management
- [ ] Profile updates
- [ ] User CRUD

**Auth Completion** (Day 13-14)

```
Expand existing auth.service.test.ts
```

- [ ] Password reset flow
- [ ] Token refresh edge cases
- [ ] Session management

### Phase 4: Feature Controllers (Weeks 3-4)

**Review System** (Days 15-16)

```
apps/api/tests/integration/reviews.test.ts
```

- [ ] Create review
- [ ] Eligibility checking
- [ ] List reviews
- [ ] Fraud prevention

**Blog Workflow** (Days 17-19)

```
apps/api/tests/integration/blogs.test.ts
```

- [ ] Create → Submit → Approve → Publish
- [ ] Draft management
- [ ] Rejection handling
- [ ] Public vs internal visibility

**Media Management** (Days 20-21)

```
apps/api/tests/integration/media.test.ts
```

- [ ] Upload validation
- [ ] Image processing
- [ ] Gallery management
- [ ] Delete handling

**Admin Operations** (Days 22-24)

```
Expand apps/api/tests/integration/admin.test.ts
```

- [ ] Dashboard data
- [ ] User management
- [ ] Role assignment
- [ ] Audit logs

### Phase 5: E2E Coverage (Week 5)

**Complete User Journeys** (Days 25-28)

```
apps/web/e2e/user-journey.spec.ts
apps/web/e2e/admin-workflow.spec.ts
```

- [ ] Register → Browse → Book → Pay → Review
- [ ] Admin: Create trip → Publish → Approve bookings
- [ ] Guide: View trips → Manage participants
- [ ] Multi-user conflict scenarios

### Phase 6: Edge Cases & Performance (Week 6)

**Edge Cases** (Days 29-30)

- [ ] Concurrent operations
- [ ] Race conditions
- [ ] Transaction rollbacks
- [ ] Network failures

**Performance Tests** (Days 31-32)

- [ ] Load testing (100+ concurrent users)
- [ ] Database query performance
- [ ] API response times

**Documentation** (Days 33-35)

- [ ] Test documentation
- [ ] CI/CD integration
- [ ] Coverage reporting setup

---

## 💡 Testing Best Practices

### 1. Test Naming Convention

```typescript
describe("ServiceName", () => {
  describe("methodName", () => {
    // Happy path
    it("should [expected behavior] when [condition]", async () => {});

    // Error cases
    it("should throw [ErrorType] when [invalid condition]", async () => {});

    // Edge cases
    it("should handle [edge case scenario]", async () => {});
  });
});
```

### 2. AAA Pattern (Arrange, Act, Assert)

```typescript
it("should create booking with valid data", async () => {
  // Arrange
  const validData = { tripId: "123", guests: 2 };
  const mockTrip = { id: "123", capacity: 10, bookedSlots: 5 };

  // Act
  const result = await bookingService.create(validData);

  // Assert
  expect(result).toMatchObject({
    id: expect.any(String),
    status: "PENDING",
  });
});
```

### 3. Mock Management

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear call counts
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore original implementations
});
```

### 4. Test Data Isolation

```typescript
// Use transactions for integration tests
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
```

### 5. Error Testing

```typescript
it("should throw HttpError for duplicate email", async () => {
  prismaMock.user.findUnique.mockResolvedValue(existingUser);

  await expect(
    authService.register({ email: "test@test.com", ... })
  ).rejects.toThrow(HttpError);

  await expect(
    authService.register({ email: "test@test.com", ... })
  ).rejects.toMatchObject({
    statusCode: 409,
    code: "EMAIL_REGISTERED"
  });
});
```

---

## 📝 Test Templates

### Unit Test Template

```typescript
// apps/api/tests/unit/example.service.test.ts
import { exampleService } from "../../src/services/example.service";
import { prisma } from "../../src/lib/prisma";
import { HttpError } from "../../src/utils/errors";

jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    model: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("ExampleService", () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should succeed with valid input", async () => {
      // Arrange
      const input = {
        /* valid data */
      };
      const mockResult = {
        /* expected result */
      };
      prismaMock.model.create.mockResolvedValue(mockResult);

      // Act
      const result = await exampleService.methodName(input);

      // Assert
      expect(result).toEqual(mockResult);
      expect(prismaMock.model.create).toHaveBeenCalledWith({
        data: input,
      });
    });

    it("should throw HttpError when resource not found", async () => {
      // Arrange
      prismaMock.model.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        exampleService.methodName({ id: "invalid" })
      ).rejects.toThrow(HttpError);
    });
  });
});
```

### Integration Test Template

```typescript
// apps/api/tests/integration/example.test.ts
import request from "supertest";
import { app } from "../../src/app";
import { PrismaClient } from "@prisma/client";
import { signAccessToken } from "../../src/utils/jwt";

const prisma = new PrismaClient();

describe("Example API", () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });
    testUserId = user.id;
    authToken = signAccessToken(testUserId);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });
    await prisma.$disconnect();
  });

  describe("POST /api/endpoint", () => {
    it("should return 201 with valid data", async () => {
      const res = await request(app)
        .post("/api/endpoint")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          /* valid payload */
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: expect.any(String),
      });
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app).post("/api/endpoint").send({
        /* payload */
      });

      expect(res.status).toBe(401);
    });

    it("should return 400 with invalid data", async () => {
      const res = await request(app)
        .post("/api/endpoint")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          /* invalid payload */
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### E2E Test Template

```typescript
// apps/web/e2e/example-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Example User Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Set up test data or mocks
    await page.goto("/");
  });

  test("should complete full workflow", async ({ page }) => {
    // Step 1: Navigate
    await page.goto("/trips");
    await expect(page.getByRole("heading", { name: "Trips" })).toBeVisible();

    // Step 2: Select item
    await page.getByText("Manali Trek").click();
    await expect(page).toHaveURL(/\/trips\/.+/);

    // Step 3: Action
    await page.getByRole("button", { name: "Book Now" }).click();

    // Step 4: Verify
    await expect(page.getByText("Booking Confirmed")).toBeVisible();
  });
});
```

---

## 🏃 Running Tests

### Run All Tests

```bash
# API tests
cd apps/api
npm test

# E2E tests
cd apps/web
npm run test:e2e

# Watch mode (development)
npm test -- --watch

# Specific test file
npm test auth.service.test.ts

# Specific test pattern
npm test -- --testNamePattern="should create booking"
```

### Run with Coverage

```bash
cd apps/api
npm test -- --coverage

# Coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/services/**/*.ts"

# HTML coverage report
npm test -- --coverage --coverageReporters=html
# Open: coverage/index.html
```

### Debug Tests

```bash
# VSCode launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal"
}

# Or use node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📈 Coverage Reports

### Configure Jest Coverage

Add to `apps/api/jest.config.js`:

```javascript
module.exports = {
  // ... existing config
  collectCoverage: false, // Enable via CLI when needed
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/instrument.ts",
    "!src/types/**",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
    "./src/services/": {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
};
```

### View Coverage Report

```bash
npm test -- --coverage
# Check terminal output

# Open HTML report
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### Coverage Badges

Add to README.md:

```markdown
![Coverage](https://img.shields.io/badge/coverage-78%25-green)
```

---

## 🎯 Success Metrics

### Current State

- **Service Coverage**: 25% (2/8)
- **Controller Coverage**: 12% (8/70+)
- **Critical Path Coverage**: 30%

### Target State (After Implementation)

- **Service Coverage**: 90% (8/8)
- **Controller Coverage**: 80% (56/70)
- **Critical Path Coverage**: 95%
- **Line Coverage**: 75%
- **Branch Coverage**: 70%

### Weekly Milestones

| Week | Focus                            | Tests Added | Expected Coverage |
| ---- | -------------------------------- | ----------- | ----------------- |
| 1    | Bug fixes + Payments + Bookings  | 15 files    | 40%               |
| 2    | Core services (Trip, User, Auth) | 12 files    | 55%               |
| 3-4  | Feature controllers              | 25 files    | 70%               |
| 5    | E2E tests                        | 8 files     | 75%               |
| 6    | Edge cases + Performance         | 5 files     | 80%               |

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Playwright E2E](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🆘 Getting Help

If you encounter issues:

1. Check test logs in `apps/api/` (\*.txt files)
2. Review existing test files for patterns
3. Consult this guide's templates
4. Search for similar tests in the codebase

---

**Next Steps**:

1. Review this guide
2. Start with Phase 1 (bug fixes)
3. Implement Phase 2 (critical security tests)
4. Track progress weekly

**Estimated Timeline**: 6 weeks for 80% coverage
**Priority**: Payment tests (Week 1) are CRITICAL
