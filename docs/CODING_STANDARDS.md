# Param Adventures - Coding Standards & Guidelines

This document outlines the coding standards, best practices, and conventions that all developers must follow when implementing features, fixing bugs, or making any other changes to the Param Adventures codebase.

**Table of Contents**

1. [General Principles](#general-principles)
2. [TypeScript/JavaScript Standards](#typescriptjavascript-standards)
3. [Code Organization](#code-organization)
4. [Naming Conventions](#naming-conventions)
5. [Error Handling](#error-handling)
6. [Testing Standards](#testing-standards)
7. [API Development](#api-development)
8. [Database & ORM](#database--orm)
9. [Frontend Development](#frontend-development)
10. [Git & Commit Standards](#git--commit-standards)
11. [Code Review Checklist](#code-review-checklist)
12. [Common Patterns](#common-patterns)

---

## General Principles

### 1. **DRY (Don't Repeat Yourself)**

- Extract repeated code into reusable functions, hooks, or components
- Create utility functions for common operations
- Use inheritance and composition appropriately

### 2. **SOLID Principles**

- **Single Responsibility**: Each function/class should have ONE reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable
- **Interface Segregation**: Use specific interfaces over generic ones
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### 3. **Keep It Simple (KISS)**

- Write clear, readable code over clever code
- Avoid over-engineering solutions
- Use simple algorithms when possible

### 4. **Code Quality**

- Aim for 80%+ test coverage for new code
- Follow ESLint and Prettier rules strictly
- All code must pass TypeScript strict mode checks
- No `any` types allowed (use `unknown` if necessary with proper guards)

---

## TypeScript/JavaScript Standards

### Type Safety

✅ **DO:**

```typescript
// Use explicit types
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Use interfaces for objects
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Use enums for constants
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

// Use unions for multiple types
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

❌ **DON'T:**

```typescript
// Avoid any type
function process(data: any) {
  // ❌ WRONG
  return data.value;
}

// Avoid loose typing
const total = calculatePrice(10, "5"); // ❌ WRONG - mixing types

// Avoid implicit any
function getData(id) {
  // ❌ WRONG - no type
  return fetch(`/api/data/${id}`);
}
```

### Variable Declaration

✅ **DO:**

```typescript
// Use const by default
const API_ENDPOINT = "https://api.example.com";

// Use let only when value will change
let retryCount = 0;

// Declare types explicitly
const users: User[] = [];
const config: Config = { ... };
```

❌ **DON'T:**

```typescript
// Avoid var
var count = 0; // ❌ WRONG

// Avoid implicit types when complex
const response = fetch(...); // ❌ WRONG - type unclear

// Don't mix declaration styles
const x = 1;
var y = 2;
let z = 3; // Inconsistent
```

### Function Standards

✅ **DO:**

```typescript
// Clear function names, explicit return types
async function getUserById(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ?? null;
}

// Use arrow functions for callbacks
const processUsers = users.map((user) => ({
  ...user,
  isActive: user.status === "ACTIVE",
}));

// Destructure parameters
function createBooking({
  userId,
  tripId,
  dates,
}: BookingInput): Promise<Booking> {
  // implementation
}

// Use early returns for guard clauses
function validateUser(user: User): void {
  if (!user.email) throw new Error("Email required");
  if (!user.name) throw new Error("Name required");
  // Main logic here
}
```

❌ **DON'T:**

```typescript
// Avoid unclear function names
function process(x, y) {
  // ❌ WRONG
  return x + y;
}

// Avoid nested callbacks (use async/await)
function getData(callback) {
  // ❌ WRONG - callback hell
  fetch(url).then((res) => {
    res.json().then((data) => {
      callback(data);
    });
  });
}

// Avoid long parameter lists
function create(a, b, c, d, e, f) {
  // ❌ WRONG
  // implementation
}

// Don't mix async/await with .then()
async function getData() {
  return await fetch(url).then((r) => r.json()); // ❌ WRONG - mix
}
```

### Comments & Documentation

✅ **DO:**

```typescript
/**
 * Creates a new booking with payment processing.
 *
 * @param userId - ID of the user making the booking
 * @param tripId - ID of the trip to book
 * @param dates - Start and end dates for the booking
 * @returns Promise<Booking> - Created booking with payment reference
 * @throws HttpError - If trip not found or user unauthorized
 *
 * @example
 * const booking = await createBooking({
 *   userId: "user123",
 *   tripId: "trip456",
 *   dates: { start: new Date(), end: new Date() }
 * });
 */
async function createBooking(input: BookingInput): Promise<Booking> {
  // implementation
}

// Explain WHY, not WHAT
// Use Razorpay order creation instead of direct payment processing
// because it provides webhooks for async confirmation
const order = await razorpayService.createOrder(amount, bookingId);
```

❌ **DON'T:**

```typescript
// Obvious comments add no value
const name = "John"; // Set name to John ❌ WRONG

// No JSDoc for public functions
function validateEmail(email: string): boolean {
  return email.includes("@");
}

// Commented-out code
// const response = await fetch(url); ❌ WRONG - remove or use git history
```

---

## Code Organization

### Directory Structure

```
apps/api/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── bookings/
│   │   │   ├── createBooking.controller.ts
│   │   │   ├── cancelBooking.controller.ts
│   │   │   └── ...
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts
│   │   ├── razorpay.service.ts
│   │   └── ...
│   ├── middlewares/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── httpError.ts
│   │   ├── validators.ts
│   │   └── ...
│   ├── lib/                 # External service configs
│   │   ├── redis.ts
│   │   ├── prisma.ts
│   │   └── ...
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── ...
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/
│   ├── unit/                # Unit tests for services
│   ├── integration/         # Integration tests for endpoints
│   └── e2e/                 # End-to-end tests
└── prisma/
    ├── schema.prisma        # Database schema
    └── migrations/          # Database migrations
```

### Separation of Concerns

✅ **DO:**

```typescript
// Controller - handles HTTP concerns
@Post("/bookings/:id/initiate-payment")
async initiatePayment(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await paymentService.initiatePayment(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// Service - contains business logic
async function initiatePayment(bookingId: string, userId: string): Promise<PaymentResult> {
  const booking = await validateBooking(bookingId, userId);
  const order = await razorpayService.createOrder(booking.amount, bookingId);

  await prisma.payment.create({
    data: { bookingId, orderId: order.id, status: "INITIATED" }
  });

  return { orderId: order.id, amount: booking.amount };
}

// Utils - pure functions
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

❌ **DON'T:**

```typescript
// Business logic in controller
@Post("/bookings")
async create(req: Request, res: Response) {
  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      tripId: req.body.tripId,
      status: "PENDING"
    }
  });

  // Should be in service
  const razorpay = new Razorpay(...);
  const order = await razorpay.orders.create({
    amount: booking.price * 100,
    receipt: booking.id
  });

  res.json(booking);
}
```

---

## Naming Conventions

### Variables & Constants

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

// Variables: camelCase
let userCount = 0;
const userName = "John";

// Booleans: use 'is', 'has', 'should', 'can'
const isActive = true;
const hasPermission = false;
const shouldRetry = true;
const canDelete = false;

// Enums: PascalCase
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
}

// Types/Interfaces: PascalCase
interface User {
  id: string;
  email: string;
}

type UserRole = "ADMIN" | "USER" | "GUIDE";
```

### Functions & Methods

```typescript
// Functions: camelCase
function calculateTotal(price: number, tax: number): number {
  return price + tax;
}

// Async functions: prefix with verb
async function fetchUserData(userId: string): Promise<User> {}
async function saveBooking(booking: Booking): Promise<void> {}

// Event handlers: 'handle' + EventName
function handleUserCreated(user: User): void {}
function handlePaymentCompleted(payment: Payment): void {}

// Getter/Setter functions
function getUser(id: string): User | null {}
function setUserStatus(id: string, status: string): Promise<void> {}
```

### File Names

```typescript
// Controllers: <action>.controller.ts or <resource>.controller.ts
createBooking.controller.ts;
booking.controller.ts;
auth.controller.ts;

// Services: <resource>.service.ts
booking.service.ts;
payment.service.ts;
razorpay.service.ts;

// Middleware: <function>.middleware.ts
auth.middleware.ts;
validate.middleware.ts;
error.middleware.ts;

// Routes: <resource>.routes.ts
auth.routes.ts;
booking.routes.ts;

// Utilities: <purpose>.ts
validators.ts;
httpError.ts;
constants.ts;
```

---

## Error Handling

### Custom Error Classes

✅ **DO:**

```typescript
// Use custom HttpError class
class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Throw with context
throw new HttpError(404, "USER_NOT_FOUND", "User not found");
throw new HttpError(409, "EMAIL_REGISTERED", "Email already registered");
throw new HttpError(403, "FORBIDDEN", "You do not have permission");
```

❌ **DON'T:**

```typescript
// Generic errors without context
throw new Error("Error");
throw new Error("Failed");

// Using strings for errors
if (!user) {
  return "User not found"; // ❌ WRONG - should throw
}
```

### Error Handling Pattern

✅ **DO:**

```typescript
// Services: throw specific errors
async function getUser(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "User not found");
  }
  return user;
}

// Controllers: catch and pass to error handler
async function handleGetUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // Pass to error middleware
  }
}

// Middleware: centralized error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error" });
});
```

### Try-Catch Pattern

✅ **DO:**

```typescript
// Use early return for guard clauses
async function processPayment(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new HttpError(404, "BOOKING_NOT_FOUND", "Booking not found");
  }

  if (booking.status !== "PENDING") {
    throw new HttpError(400, "INVALID_STATUS", "Booking not in pending status");
  }

  // Main logic here
}

// Catch only what you can handle
try {
  const result = await externalAPI.call();
} catch (error) {
  if (error instanceof NetworkError) {
    throw new HttpError(503, "SERVICE_UNAVAILABLE", "External service down");
  }
  throw error; // Re-throw unknown errors
}
```

---

## Testing Standards

### Test Structure

✅ **DO:**

```typescript
describe("BookingService", () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      // Arrange
      const input = { userId: "123", tripId: "456" };

      // Act
      const booking = await bookingService.createBooking(input);

      // Assert
      expect(booking).toBeDefined();
      expect(booking.status).toBe("PENDING");
    });

    it("should throw error if trip not found", async () => {
      // Arrange
      const input = { userId: "123", tripId: "nonexistent" };

      // Act & Assert
      await expect(bookingService.createBooking(input)).rejects.toThrow(
        "Trip not found"
      );
    });
  });
});
```

### Test Coverage Requirements

```typescript
// Unit tests: 80%+ coverage
// - Services: 100% of public methods
// - Utils: 100% of functions
// - Controllers: 70%+ of happy paths and error cases

// Integration tests: Critical paths
// - Payment flow
// - Authentication
// - Booking creation
// - Authorization checks

// E2E tests: User workflows
// - Complete booking flow
// - Payment verification
// - Trip browsing and filtering
```

### Mocking Strategy

✅ **DO:**

```typescript
// Mock external services
jest.mock("../../services/razorpay.service");

const razorpayService = require("../../services/razorpay.service");

describe("PaymentController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initiate payment", async () => {
    // Mock the service
    razorpayService.createOrder.mockResolvedValue({
      id: "order_123",
      amount: 10000,
    });

    // Test
    const result = await controller.initiatePayment(req, res);

    // Assert
    expect(razorpayService.createOrder).toHaveBeenCalledWith(
      10000,
      "booking_456"
    );
  });
});
```

---

## API Development

### Endpoint Standards

#### Route Definition

✅ **DO:**

```typescript
// RESTful naming
GET    /api/bookings              // List all bookings
GET    /api/bookings/:id          // Get specific booking
POST   /api/bookings              // Create booking
PATCH  /api/bookings/:id          // Update booking
DELETE /api/bookings/:id          // Delete booking

// Actions on resources
POST   /api/bookings/:id/initiate-payment
POST   /api/bookings/:id/verify-payment
POST   /api/bookings/:id/refund

// Nested resources
GET    /api/trips/:tripId/reviews
POST   /api/trips/:tripId/reviews
```

❌ **DON'T:**

```typescript
// Non-RESTful verbs in URL
GET    /api/getBookings           ❌
POST   /api/createBooking         ❌
DELETE /api/deleteBooking/:id     ❌

// Inconsistent naming
GET    /bookings
POST   /create-booking            ❌ - inconsistent
```

#### Request/Response Format

✅ **DO:**

```typescript
// Success response
res.json({
  data: booking,
  message: "Booking created successfully",
});

// Error response
res.status(400).json({
  error: "Invalid input",
  code: "VALIDATION_ERROR",
  details: {
    email: "Email is required",
  },
});

// Pagination
res.json({
  data: bookings,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 100,
    totalPages: 10,
  },
});
```

#### Input Validation

✅ **DO:**

```typescript
// Use Zod for validation
import { z } from "zod";

const CreateBookingSchema = z.object({
  tripId: z.string().uuid(),
  userId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date(),
  participants: z.number().positive().min(1),
});

// In route handler
const validateCreateBooking = validate(CreateBookingSchema);

router.post("/bookings", validateCreateBooking, async (req, res) => {
  const validatedData = req.body; // Already validated
  // implementation
});
```

---

## Database & ORM

### Prisma Schema Standards

✅ **DO:**

```prisma
// Model naming: PascalCase
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role      @default(USER)
  status        String    @default("ACTIVE")

  // Relations
  bookings      Booking[]
  profile       Profile?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Indexes for frequently queried fields
  @@index([email])
  @@index([status])
}

model Booking {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  tripId        String
  trip          Trip      @relation(fields: [tripId], references: [id])

  status        BookingStatus @default(PENDING)

  // Numeric fields: store in cents for money
  totalPrice    Int       // in cents

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Composite index
  @@unique([userId, tripId])
  @@index([tripId])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}
```

### Prisma Query Patterns

✅ **DO:**

```typescript
// Select specific fields for performance
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    bookings: {
      select: { id: true, status: true },
    },
  },
});

// Use relations efficiently
const booking = await prisma.booking.findUnique({
  where: { id: bookingId },
  include: {
    user: {
      select: { id: true, email: true },
    },
    trip: true,
  },
});

// Use where conditions properly
const activeBookings = await prisma.booking.findMany({
  where: {
    status: "CONFIRMED",
    trip: {
      isPublished: true,
    },
  },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
});
```

❌ **DON'T:**

```typescript
// N+1 queries
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  // This queries DB again for each booking!
  const user = await prisma.user.findUnique({ where: { id: booking.userId } });
}

// Selecting unnecessary fields
const users = await prisma.user.findMany(); // Gets all fields
```

---

## Frontend Development

### Component Structure

```typescript
// Path: apps/web/src/components/BookingCard.tsx

import { FC } from "react";

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Displays booking information with cancel action.
 */
export const BookingCard: FC<BookingCardProps> = ({
  booking,
  onCancel,
  isLoading = false
}) => {
  const handleCancel = async () => {
    await onCancel(booking.id);
  };

  return (
    <div className="booking-card">
      <h3>{booking.tripName}</h3>
      <p>{booking.status}</p>
      <button onClick={handleCancel} disabled={isLoading}>
        Cancel Booking
      </button>
    </div>
  );
};
```

### Hook Standards

✅ **DO:**

```typescript
// Custom hooks for logic extraction
export function useBooking(bookingId: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  return { booking, loading, error };
}

// Usage in component
function BookingDetail({ id }: { id: string }) {
  const { booking, loading, error } = useBooking(id);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <BookingCard booking={booking} />;
}
```

---

## Git & Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Refactoring code
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build, CI, dependencies

**Example Commits:**

✅ **DO:**

```
feat(booking): add payment initiation endpoint

- Create POST /bookings/:id/initiate-payment endpoint
- Integrate Razorpay order creation
- Add request validation with Zod
- Add unit tests for payment service

Closes #123
```

```
fix(auth): handle concurrent login attempts

- Add mutex lock for auth token generation
- Prevent duplicate token creation
- Add integration test for concurrent logins

Fixes #456
```

❌ **DON'T:**

```
Fixed stuff
Updated code
Work in progress
asdf
```

### Branch Naming

```
feature/booking-payment
fix/auth-token-issue
docs/update-readme
refactor/payment-service
test/add-razorpay-tests
```

---

## Code Review Checklist

### Before Creating PR

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code formatted (`npm run format`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Added/updated tests for changes
- [ ] Updated relevant documentation
- [ ] No console.log statements (except logging)
- [ ] No commented-out code
- [ ] Meaningful commit messages

### Code Review Criteria

**Functionality**

- [ ] Code solves the stated problem
- [ ] No breaking changes to existing APIs
- [ ] Handles edge cases and errors
- [ ] Performance is acceptable

**Quality**

- [ ] Follows coding standards from this guide
- [ ] Code is readable and maintainable
- [ ] Functions have clear responsibility
- [ ] Proper error handling

**Testing**

- [ ] Unit tests cover business logic
- [ ] Integration tests for API endpoints
- [ ] Tests are meaningful, not just for coverage
- [ ] Edge cases are tested

**Security**

- [ ] Input validation on all endpoints
- [ ] Authorization checks on protected routes
- [ ] No sensitive data in logs
- [ ] SQL injection prevention (Prisma handles this)

**Documentation**

- [ ] JSDoc comments on public functions
- [ ] Complex logic is explained
- [ ] API documentation updated
- [ ] README updated if needed

---

## Common Patterns

### Authentication Flow

```typescript
// Middleware: Check and attach user to request
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new HttpError(401, "UNAUTHORIZED", "No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded as JWTPayload;
    next();
  } catch (error) {
    next(error);
  }
};

// Controller: Use authenticated user
@Post("/bookings")
@UseMiddleware(authMiddleware)
async createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user.id, // From middleware
      tripId: req.body.tripId,
      dates: req.body.dates
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}
```

### Permission Checking

```typescript
// Middleware: Check specific permission
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUser(req.user.id);
      const hasPermission = await permissionService.check(user.role, permission);

      if (!hasPermission) {
        throw new HttpError(403, "FORBIDDEN", `Permission '${permission}' required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Usage
@Delete("/bookings/:id")
@UseMiddleware(authMiddleware)
@UseMiddleware(requirePermission("booking:delete"))
async deleteBooking(req: Request, res: Response, next: NextFunction) {
  // implementation
}
```

### Service Layer Pattern

```typescript
// Keep services focused and testable
export class BookingService {
  constructor(
    private prisma: PrismaClient,
    private razorpayService: RazorpayService,
    private emailService: EmailService
  ) {}

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // Validate
    const trip = await this.validateTrip(input.tripId);

    // Create
    const booking = await this.prisma.booking.create({
      data: {
        userId: input.userId,
        tripId: input.tripId,
        status: "PENDING",
        totalPrice: trip.price,
      },
    });

    // Side effects
    await this.emailService.sendBookingConfirmation(booking);

    return booking;
  }

  private async validateTrip(tripId: string): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");
    }
    return trip;
  }
}
```

---

## Enforcement & Tools

### Automated Checks

- **TypeScript**: Strict mode enabled - must pass type checking
- **ESLint**: Runs on commit, fails if errors found
- **Prettier**: Auto-formats code on commit
- **Tests**: Must pass before merge (pre-commit hook)

### Running Checks Locally

```bash
# API checks
cd apps/api
npm run lint              # Run ESLint
npm run format            # Format with Prettier
npm run type-check        # TypeScript type checking
npm test                  # Run all tests
npm test -- --coverage    # With coverage report

# Frontend checks
cd apps/web
npm run lint
npm run format
npm run type-check
npm test
```

---

## Questions & Support

For questions about coding standards:

1. Check the relevant section above
2. Review existing code in the repository
3. Ask in team discussions
4. Create an issue for clarifications needed

Remember: **Code is read much more often than it's written. Write for the next developer!**

---

**Last Updated**: January 16, 2026
**Maintained By**: Development Team
