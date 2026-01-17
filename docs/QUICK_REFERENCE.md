# Quick Reference Guide - Param Adventures

Essential commands, endpoints, and patterns for developers.

---

## 🚀 Quick Start

### Development Environment Setup

```bash
# Clone and install
git clone <repo>
cd Param_Adventures_Phase1
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run tests
cd apps/api
npm test

# Start development
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

### Database Setup

```bash
cd apps/api

# Create database
createdb param_adventures_dev

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npm run seed
```

---

## 📋 Common Commands

### Testing

```bash
# All tests
npm test

# Specific suite
npm test -- auth.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# No coverage
npm test -- --no-coverage
```

### Building

```bash
# Build backend
npm run build -w apps/api

# Build frontend
npm run build -w apps/web

# Build both
npm run build
```

### Database

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# View database
npx prisma studio

# Reset database
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy
```

### Git

```bash
# Create feature branch
git checkout -b feature/your-feature

# Stage and commit
git add .
git commit -m "feat: your feature description"

# Push branch
git push origin feature/your-feature

# Create pull request
# Go to GitHub and open PR

# Merge to main
git merge main
git push origin main
```

---

## 🔌 API Endpoints Quick Reference

### Authentication

```bash
# Register
POST /auth/register
Content-Type: application/json
{ "email": "user@example.com", "password": "Pass123", "name": "John" }

# Login
POST /auth/login
{ "email": "user@example.com", "password": "Pass123" }

# Refresh token
POST /auth/refresh
{ "refreshToken": "token..." }

# Logout
POST /auth/logout
Authorization: Bearer <token>
```

### Users

```bash
# Get profile
GET /users/profile
Authorization: Bearer <token>

# Update profile
PATCH /users/profile
Authorization: Bearer <token>
{ "name": "New Name", "avatar": "url..." }

# Get user by ID
GET /users/:id
```

### Trips

```bash
# List all trips
GET /trips?page=1&limit=10&difficulty=MODERATE

# Get trip details
GET /trips/:id

# Create trip (admin)
POST /trips
Authorization: Bearer <token>
Content-Type: application/json
{ "title": "Trek", "price": 10000, "durationDays": 5, ... }

# Update trip
PATCH /trips/:id
Authorization: Bearer <token>

# Publish trip (admin)
PATCH /trips/:id/publish
Authorization: Bearer <token>

# Delete trip (admin)
DELETE /trips/:id
Authorization: Bearer <token>
```

### Bookings

```bash
# Create booking
POST /bookings
Authorization: Bearer <token>
{ "tripId": "trip-id", "numPeople": 2, "checkInDate": "2026-02-15" }

# Get bookings
GET /bookings?status=PENDING&page=1
Authorization: Bearer <token>

# Get booking details
GET /bookings/:id
Authorization: Bearer <token>

# Cancel booking
PATCH /bookings/:id/cancel
Authorization: Bearer <token>
```

### Payments

```bash
# Initiate payment
POST /bookings/:id/initiate-payment
Authorization: Bearer <token>

# Verify payment
POST /bookings/:id/verify-payment
Authorization: Bearer <token>
{ "razorpay_order_id": "order_...", "razorpay_payment_id": "pay_...", "razorpay_signature": "sig..." }

# Get payment status
GET /bookings/:id/payment-status
Authorization: Bearer <token>

# Payment history
GET /bookings/payments/history?page=1&limit=10
Authorization: Bearer <token>

# Refund booking (admin)
POST /bookings/:id/refund
Authorization: Bearer <token>
{ "amount": 5000, "reason": "Customer request" }

# Get invoice
GET /bookings/:id/invoice
Authorization: Bearer <token>
```

### Reviews

```bash
# Create review
POST /reviews
Authorization: Bearer <token>
{ "bookingId": "booking-id", "rating": 5, "comment": "Great trip!" }

# Get reviews for trip
GET /trips/:id/reviews

# Update review
PATCH /reviews/:id
Authorization: Bearer <token>

# Delete review
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Blogs

```bash
# List blogs
GET /blogs?status=PUBLISHED&page=1

# Get blog post
GET /blogs/:slug

# Create blog (admin)
POST /blogs
Authorization: Bearer <token>
{ "title": "...", "content": "...", "excerpt": "..." }

# Update blog
PATCH /blogs/:id
Authorization: Bearer <token>

# Publish blog
PATCH /blogs/:id/publish
Authorization: Bearer <token>

# Delete blog
DELETE /blogs/:id
Authorization: Bearer <token>
```

### Admin

```bash
# Analytics dashboard
GET /admin/analytics/dashboard
Authorization: Bearer <token>

# Revenue stats
GET /admin/analytics/revenue?months=6
Authorization: Bearer <token>

# Get all bookings
GET /admin/bookings?status=PENDING&page=1
Authorization: Bearer <token>

# Get refund history
GET /admin/refunds?page=1&limit=20
Authorization: Bearer <token>

# Get users
GET /admin/users?page=1&limit=20
Authorization: Bearer <token>

# Assign user role (super_admin only)
POST /admin/users/:id/roles
Authorization: Bearer <token>
{ "roleId": "role-id" }
```

---

## 🛠️ Development Patterns

### Service Layer Pattern

```typescript
// apps/api/src/services/user.service.ts
export class UserService {
  static async getUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async createUser(data: UserCreateInput) {
    // Validate
    // Hash password
    // Create in DB
    // Send email
    return user;
  }
}
```

### Controller Pattern

```typescript
// apps/api/src/controllers/user.controller.ts
export async function getUserProfile(req: Request, res: Response) {
  try {
    const user = await UserService.getUser(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    handleError(error, res);
  }
}
```

### Route Pattern

```typescript
// apps/api/src/routes/user.routes.ts
const router = express.Router();

router.use(requireAuth);
router.get("/profile", getUserProfile);
router.patch("/profile", updateUserProfile);

export default router;
```

### Middleware Pattern

```typescript
// apps/api/src/middlewares/auth.middleware.ts
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

### Error Handling Pattern

```typescript
// Throw specific errors
throw new ValidationError("Invalid email");
throw new NotFoundError("User not found");
throw new UnauthorizedError("Invalid credentials");
throw new ForbiddenError("Permission denied");

// Error middleware catches all
app.use(errorMiddleware);
```

### Database Query Pattern

```typescript
// Single record
const user = await prisma.user.findUnique({
  where: { id },
  include: { roles: true },
});

// Multiple records
const users = await prisma.user.findMany({
  where: { status: "ACTIVE" },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});

// Aggregation
const count = await prisma.user.count({
  where: { status: "ACTIVE" },
});
```

### Testing Pattern

```typescript
describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get user by id", async () => {
    // Arrange
    const mockUser = { id: "1", email: "user@test.com" };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const result = await UserService.getUser("1");

    // Assert
    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
  });
});
```

---

## 🔐 Security Checklist

- [ ] Always verify user owns resource before modifying
- [ ] Check permissions before sensitive operations
- [ ] Hash passwords with bcrypt (11+ rounds)
- [ ] Validate all user input
- [ ] Use prepared statements (Prisma does this)
- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Validate JWT signatures
- [ ] Don't log sensitive data
- [ ] Set secure CORS headers
- [ ] Use Content-Security-Policy
- [ ] Validate file uploads (type, size)
- [ ] Escape/sanitize HTML output

---

## 📊 Database Tips

### Performance

```typescript
// ✅ GOOD: Use specific fields
prisma.user.findMany({
  select: { id: true, email: true, name: true },
});

// ❌ BAD: Select all fields
prisma.user.findMany();

// ✅ GOOD: Use pagination
prisma.trip.findMany({ skip: 0, take: 10 });

// ❌ BAD: Load everything
prisma.trip.findMany();

// ✅ GOOD: Include related data
prisma.booking.findUnique({
  where: { id },
  include: { payment: true, guestDetails: true },
});

// ❌ BAD: N+1 queries
const booking = await prisma.booking.findUnique({ where: { id } });
const payment = await prisma.payment.findUnique({ where: { bookingId: id } });
```

### Transactions

```typescript
const [booking, payment] = await prisma.$transaction([
  prisma.booking.create({ data: bookingData }),
  prisma.payment.create({ data: paymentData }),
]);
```

---

## 🔌 Common Integration Points

### Razorpay Payment

```typescript
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
const order = await razorpay.orders.create({
  amount: 100000, // in paise
  currency: "INR",
});
```

### Cloudinary Upload

```typescript
import { v2 as cloudinary } from "cloudinary";

const result = await cloudinary.uploader.upload(file.path, {
  folder: "param-adventures",
});
```

### BullMQ Queue

```typescript
import { Queue } from "bullmq";

const emailQueue = new Queue("email-queue", {
  connection: { url: process.env.REDIS_URL },
});

await emailQueue.add("booking-confirmation", {
  to: user.email,
  bookingId: booking.id,
});
```

### Redis Cache

```typescript
import redis from "redis";

const client = redis.createClient({ url: process.env.REDIS_URL });

// Cache trip
await client.set(`trip:${id}`, JSON.stringify(trip), { EX: 3600 });

// Get from cache
const cached = await client.get(`trip:${id}`);
```

---

## 🐛 Debugging Tips

```bash
# View database
npx prisma studio

# Check logs
tail -f logs/app.log

# Test endpoint
curl -X GET http://localhost:3001/health

# Debug test
npm test -- --testNamePattern="specific test" --verbose

# VSCode debugger (set breakpoint and press F5)
```

---

## 📚 File Locations

| Component       | Location                    |
| --------------- | --------------------------- |
| **Services**    | `apps/api/src/services/`    |
| **Controllers** | `apps/api/src/controllers/` |
| **Routes**      | `apps/api/src/routes/`      |
| **Middleware**  | `apps/api/src/middlewares/` |
| **Schemas**     | `apps/api/src/schemas/`     |
| **Types**       | `apps/api/src/types/`       |
| **Tests**       | `apps/api/tests/`           |
| **Database**    | `apps/api/prisma/`          |
| **Frontend**    | `apps/web/src/`             |
| **Docs**        | `docs/`                     |

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Run tests (all passing)
- [ ] Review ESLint (0 errors)
- [ ] Build frontend and backend
- [ ] Test health endpoint
- [ ] Check database backups
- [ ] Configure Razorpay webhooks
- [ ] Setup error monitoring (Sentry)
- [ ] Enable HTTPS/SSL
- [ ] Setup DNS
- [ ] Monitor logs
- [ ] Setup uptime monitoring

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
