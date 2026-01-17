# Testing Developer Guide - Param Adventures

Comprehensive guide for writing, running, and maintaining tests.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Stack](#test-stack)
3. [Project Structure](#project-structure)
4. [Running Tests](#running-tests)
5. [Writing Unit Tests](#writing-unit-tests)
6. [Writing Integration Tests](#writing-integration-tests)
7. [Test Patterns & Best Practices](#test-patterns--best-practices)
8. [Mocking & Fixtures](#mocking--fixtures)
9. [Database Testing](#database-testing)
10. [Coverage & Quality](#coverage--quality)
11. [Continuous Integration](#continuous-integration)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Param Adventures follows a comprehensive testing strategy:

- **Unit Tests**: Test individual functions/methods in isolation
- **Integration Tests**: Test API endpoints with real database
- **E2E Tests** (optional): Test complete user flows

**Current Test Coverage**: 350/350 tests passing (31 suites, 100%)

---

## 🛠️ Test Stack

| Tool                   | Purpose                 | Docs                                                             |
| ---------------------- | ----------------------- | ---------------------------------------------------------------- |
| **Jest**               | Test framework & runner | [jestjs.io](https://jestjs.io)                                   |
| **Supertest**          | HTTP assertions         | [github.com/ladjs/supertest](https://github.com/ladjs/supertest) |
| **Prisma**             | Database access         | [prisma.io](https://prisma.io)                                   |
| **jest-mock-extended** | Advanced mocking        | [npm](https://www.npmjs.com/package/jest-mock-extended)          |
| **Playwright**         | E2E testing (optional)  | [playwright.dev](https://playwright.dev)                         |

---

## 📁 Project Structure

```
apps/api/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── globalTeardown.ts           # Cleanup after all tests
│   ├── integration/                # API endpoint tests
│   │   ├── auth.test.ts
│   │   ├── trips.test.ts
│   │   ├── bookings.test.ts
│   │   ├── payments.test.ts
│   │   ├── blogs.test.ts
│   │   ├── reviews.test.ts
│   │   ├── media.test.ts
│   │   ├── admin-operations.test.ts
│   │   ├── admin_analytics.test.ts
│   │   ├── user-endpoints.test.ts
│   │   ├── rbac.test.ts
│   │   └── auth_helper.ts          # Auth utilities
│   └── unit/                       # Isolated function tests
│       ├── auth.service.test.ts
│       ├── trip.service.test.ts
│       ├── booking.service.test.ts
│       ├── payment.service.test.ts
│       ├── blog.service.test.ts
│       ├── review.service.test.ts
│       ├── user.service.test.ts
│       ├── admin.service.test.ts
│       └── notification.service.test.ts
├── jest.config.js                  # Jest configuration
└── src/                            # Application code
```

---

## 🚀 Running Tests

### All Tests

```bash
cd apps/api
npm test
```

### Without Coverage

```bash
npm test --no-coverage
```

### Specific Test File

```bash
npm test -- payments.test.ts
npm test -- payment.service.test.ts
```

### Watch Mode

```bash
npm test -- --watch
```

### Filter by Pattern

```bash
npm test -- --testNamePattern="should create booking"
```

### Integration Tests Only

```bash
npm test -- tests/integration/
```

### Unit Tests Only

```bash
npm test -- tests/unit/
```

---

## 🧪 Writing Unit Tests

### Basic Structure

```typescript
import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { TripService } from "../../src/services/trip.service";

// Mock Prisma client
jest.mock("../../src/lib/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from "../../src/lib/prisma";

describe("TripService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTrips", () => {
    it("should return all trips", async () => {
      // Arrange
      const mockTrips = [
        { id: "1", title: "Trip 1", status: "PUBLISHED" },
        { id: "2", title: "Trip 2", status: "PUBLISHED" },
      ];
      (prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips);

      // Act
      const result = await TripService.getTrips();

      // Assert
      expect(result).toEqual(mockTrips);
      expect(prisma.trip.findMany).toHaveBeenCalledWith({
        where: { status: "PUBLISHED" },
      });
    });

    it("should throw error when database fails", async () => {
      // Arrange
      (prisma.trip.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(TripService.getTrips()).rejects.toThrow("Database error");
    });
  });
});
```

### Key Principles

1. **AAA Pattern**: Arrange → Act → Assert
2. **Descriptive Names**: `should return trips when status is published`
3. **Single Responsibility**: One assertion per test (or related assertions)
4. **Clear Mocks**: Mock only external dependencies
5. **Reset State**: Use `beforeEach` to clear mocks

---

## 🌐 Writing Integration Tests

### Basic Structure

```typescript
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/utils/jwt";

describe("Trip Endpoints", () => {
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Clean database
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: "hashed",
        name: "Admin",
      },
    });
    adminId = admin.id;
    adminToken = signAccessToken(admin.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /trips", () => {
    it("should create trip with valid data", async () => {
      const response = await request(app)
        .post("/trips")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Himalayan Trek",
          description: "Amazing trek",
          price: 15000,
          durationDays: 7,
          difficulty: "MODERATE",
          location: "Himalayas",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Himalayan Trek");
    });

    it("should return 401 without auth", async () => {
      const response = await request(app).post("/trips").send({
        title: "Test Trip",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with invalid data", async () => {
      const response = await request(app)
        .post("/trips")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          title: "Test",
        });

      expect(response.status).toBe(400);
    });
  });
});
```

### Key Principles

1. **Real Database**: Use test database (not mocks)
2. **Setup & Teardown**: Clean state between tests
3. **HTTP Assertions**: Test actual API responses
4. **Auth Testing**: Test both authenticated and unauthenticated
5. **Error Cases**: Test validation, permissions, edge cases

---

## 🎨 Test Patterns & Best Practices

### 1. Descriptive Test Names

✅ **Good**:

```typescript
it("should return 403 when user lacks permission");
it("should create booking and send confirmation email");
it("should handle partial refund correctly");
```

❌ **Bad**:

```typescript
it("works");
it("test booking");
it("check permissions");
```

### 2. One Concept Per Test

✅ **Good**:

```typescript
it("should create user with valid data", async () => {
  const user = await userService.create({ email, password });
  expect(user.email).toBe(email);
});

it("should hash password on user creation", async () => {
  const user = await userService.create({ email, password });
  expect(user.password).not.toBe(password);
});
```

❌ **Bad**:

```typescript
it("should create user", async () => {
  const user = await userService.create({ email, password });
  expect(user.email).toBe(email);
  expect(user.password).not.toBe(password);
  expect(user.createdAt).toBeDefined();
  expect(user.status).toBe("ACTIVE");
});
```

### 3. Test Edge Cases

Always test:

- ✅ Happy path
- ✅ Missing required fields
- ✅ Invalid data types
- ✅ Unauthorized access
- ✅ Resource not found
- ✅ Duplicate entries
- ✅ Boundary values

### 4. Avoid Test Interdependence

❌ **Bad**:

```typescript
let userId: string;

it("should create user", async () => {
  const user = await userService.create({ email, password });
  userId = user.id; // Next test depends on this
});

it("should update user", async () => {
  await userService.update(userId, { name: "New" }); // Breaks if first test fails
});
```

✅ **Good**:

```typescript
it("should update user", async () => {
  // Create user within this test
  const user = await userService.create({ email, password });
  await userService.update(user.id, { name: "New" });
  // Assert
});
```

### 5. Use Test Helpers

Create reusable utilities:

```typescript
// tests/helpers/auth_helper.ts
export function generateAuthToken(userId: string) {
  return signAccessToken(userId);
}

export async function createTestUser(overrides = {}) {
  return await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "hashed",
      name: "Test User",
      ...overrides,
    },
  });
}
```

---

## 🎭 Mocking & Fixtures

### Mocking External Services

```typescript
// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://cloudinary.com/image.jpg",
        public_id: "image_123",
      }),
    },
  },
}));

// Mock Razorpay
jest.mock("razorpay", () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: "order_test123",
        amount: 150000,
        currency: "INR",
      }),
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: "pay_test123",
        status: "captured",
      }),
    },
  }));
});

// Mock BullMQ Queue
jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "job-123" }),
    on: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));
```

### Test Fixtures

Create reusable test data:

```typescript
// tests/fixtures/trips.ts
export const validTripData = {
  title: "Test Trek",
  description: "A test adventure",
  price: 10000,
  durationDays: 5,
  difficulty: "MODERATE",
  location: "Himalayas",
  itinerary: { days: [] },
  status: "PUBLISHED",
};

export const createTripFixture = (overrides = {}) => ({
  ...validTripData,
  ...overrides,
});
```

Usage:

```typescript
const tripData = createTripFixture({ price: 20000 });
const trip = await prisma.trip.create({ data: tripData });
```

---

## 🗄️ Database Testing

### Test Database Setup

**Environment Variables** (`apps/api/tests/setup.ts`):

```typescript
process.env.DATABASE_URL = "postgresql://user:pass@localhost:5433/param_test";
process.env.NODE_ENV = "test";
```

### Migration Setup

Run migrations before tests:

```typescript
// tests/setup.ts
import { execSync } from "child_process";

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});
```

### Global Teardown

Clean all tables after tests:

```typescript
// tests/globalTeardown.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function globalTeardown() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  await prisma.$disconnect();
}
```

### Cleanup Best Practices

1. **Comprehensive Cleanup**: Delete all related tables in correct order (FK constraints)
2. **Unique Test Data**: Use unique emails/slugs per test suite
3. **Isolation**: Each test suite should clean its own data in `beforeAll`

**Example**:

```typescript
beforeAll(async () => {
  // Clean in FK-safe order
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  // Create test data
  testUser = await prisma.user.create({
    data: { email: "unique_test@example.com", password: "hash" },
  });
});
```

### Avoiding Email/Slug Collisions

Use prefixes or timestamps:

```typescript
// Unique per suite
const testEmail = `trips_test_${Date.now()}@example.com`;
const testSlug = `test-trip-${Date.now()}`;

// Or use suite-specific prefixes
const testEmail = "trips_suite_admin@test.com";
```

---

## 📊 Coverage & Quality

### Running Coverage Report

```bash
npm test -- --coverage
```

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Current Coverage

- **Test Suites**: 31/31 (100%)
- **Tests**: 350/350 (100%)
- **Unit Tests**: All services covered
- **Integration Tests**: All endpoints covered

### Coverage Best Practices

1. **Prioritize Critical Code**: Payment processing, auth, permissions
2. **Don't Chase 100%**: Focus on business logic, not boilerplate
3. **Test Behavior**: Not implementation details
4. **Edge Cases**: Validate error handling

---

## 🔄 Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: param_test
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        working-directory: apps/api

      - name: Run tests
        run: npm test --no-coverage
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/param_test
```

---

## 🐛 Troubleshooting

### Tests Hang or Timeout

**Symptoms**: Tests don't complete, Jest waits indefinitely

**Causes**:

1. Open database connections
2. Unresolved promises
3. Background workers

**Solutions**:

```bash
# Use --detectOpenHandles to find leaks
npm test -- --detectOpenHandles

# Force exit
npm test -- --forceExit
```

In `jest.config.js`:

```javascript
module.exports = {
  forceExit: true,
  maxWorkers: 1, // Run serially to avoid DB conflicts
};
```

---

### Database Constraint Errors

**Symptoms**: `Unique constraint failed` or `Foreign key constraint failed`

**Causes**:

1. Data left from previous tests
2. Parallel test execution
3. Missing cleanup

**Solutions**:

1. Add comprehensive `beforeAll` cleanup
2. Use unique test data (emails, slugs)
3. Run tests serially: `maxWorkers: 1`

```typescript
beforeAll(async () => {
  // Delete in FK-safe order
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();
});
```

---

### Mock Not Working

**Symptoms**: Mock returns `undefined` or real implementation runs

**Causes**:

1. Mock defined after import
2. Incorrect mock path
3. Mock cleared too early

**Solutions**:

```typescript
// ✅ Define mock BEFORE importing module
jest.mock("../../src/lib/prisma");
import { prisma } from "../../src/lib/prisma";

// ✅ Use correct relative path
jest.mock("../../src/services/email.service");

// ✅ Clear mocks in beforeEach, not afterEach
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

### Test Fails Intermittently

**Symptoms**: Test passes sometimes, fails other times

**Causes**:

1. Race conditions
2. Shared state between tests
3. Time-dependent logic

**Solutions**:

1. Avoid shared mutable state
2. Use `beforeEach` to reset state
3. Mock `Date.now()` for time-sensitive tests

```typescript
// Mock time
const mockDate = new Date("2026-01-17T10:00:00Z");
jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
```

---

### DATABASE_URL Missing in Teardown

**Symptoms**: `globalTeardown.ts` fails with "DATABASE_URL not found"

**Solution**: Set env in teardown file:

```typescript
// tests/globalTeardown.ts
const TEST_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/param_test";
process.env.DATABASE_URL = TEST_DB_URL;

const prisma = new PrismaClient();
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/ladjs/supertest#readme)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 📞 Getting Help

**Internal Resources**:

- Review existing tests in `apps/api/tests/`
- Check [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for high-level approach
- See [TEST_PLAN.md](./TEST_PLAN.md) for test case specifications

**External Support**:

- Jest Discord: [discord.gg/jest](https://discord.gg/jest)
- Stack Overflow: Tag `jest`, `supertest`, `prisma`

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0  
**Contributors**: Development Team
