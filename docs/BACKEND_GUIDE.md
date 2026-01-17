# Backend Development Guide - Param Adventures

Comprehensive guide for backend API development patterns and best practices.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Service Architecture](#service-architecture)
4. [Controllers & Routes](#controllers--routes)
5. [Database Access](#database-access)
6. [Error Handling](#error-handling)
7. [Validation](#validation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Testing](#testing)
10. [Common Tasks](#common-tasks)

---

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry point
│   ├── controllers/        # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── trips.controller.ts
│   │   ├── bookings.controller.ts
│   │   └── payments.controller.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── trip.service.ts
│   │   ├── booking.service.ts
│   │   └── payment.service.ts
│   ├── routes/             # Express route definitions
│   │   ├── auth.routes.ts
│   │   ├── trips.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── webhooks.routes.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── cors.middleware.ts
│   ├── utils/              # Utility functions
│   │   ├── jwt.ts
│   │   ├── hash.ts
│   │   ├── email.ts
│   │   └── logger.ts
│   ├── validators/         # Input validation schemas
│   │   ├── auth.validator.ts
│   │   ├── booking.validator.ts
│   │   └── trip.validator.ts
│   ├── types/              # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── errors.ts
│   ├── jobs/               # Background job handlers
│   │   ├── email.job.ts
│   │   ├── payment.job.ts
│   │   └── notification.job.ts
│   ├── constants/          # App constants
│   │   ├── errors.ts
│   │   ├── status.ts
│   │   └── roles.ts
│   └── config/             # Configuration
│       ├── database.ts
│       ├── redis.ts
│       └── payment.ts
├── prisma/                 # Database schemas
│   ├── schema.prisma
│   └── migrations/
├── tests/                  # Test files
│   ├── auth.test.ts
│   ├── bookings.test.ts
│   └── fixtures/
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 🚀 Getting Started

### Setup

```bash
cd apps/api
npm install
cp .env.example .env.local

# .env.local should contain:
DATABASE_URL=postgresql://user:pass@localhost:5432/param_adventures
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

### Run Development

```bash
npm run dev

# API runs on http://localhost:3001
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Service Architecture

The API uses a 3-layer architecture:

```
Request → Controller → Service → Database
         ↓ validates  ↓ business ↓ query
Response ← ← ← ← ← ← ← ← ← ← ←
```

### Example: Trip Service

```typescript
// src/services/trip.service.ts
import { prisma } from '@/config/database';

export class TripService {
  async getTrips(filters: {
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, location, page = 1, limit = 20 } = filters;
    
    const skip = (page - 1) * limit;
    
    const trips = await prisma.trip.findMany({
      where: {
        category,
        location,
        published: true,  // Always filter published trips
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        image: true,
        category: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.trip.count({
      where: { category, location, published: true },
    });

    return {
      data: trips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTripBySlug(slug: string) {
    const trip = await prisma.trip.findUnique({
      where: { slug },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        bookings: {
          select: { id: true, status: true },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    return trip;
  }

  async createTrip(data: {
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    image: string;
    creatorId: string;
  }) {
    // Validate input
    if (data.price < 0) {
      throw new Error('Price must be positive');
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        title: data.title,
        slug: this.generateSlug(data.title),
        description: data.description,
        price: data.price,
        location: data.location,
        category: data.category,
        image: data.image,
        creatorId: data.creatorId,
        published: false,  // Default unpublished
      },
    });

    return trip;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

export const tripService = new TripService();
```

---

## 🎮 Controllers & Routes

### Controller Pattern

```typescript
// src/controllers/trips.controller.ts
import { Request, Response, NextFunction } from 'express';
import { tripService } from '@/services/trip.service';
import { ApiResponse } from '@/types/api';

export class TripsController {
  async getTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, location, page, limit } = req.query;

      const result = await tripService.getTrips({
        category: category as string,
        location: location as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async getTripBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const trip = await tripService.getTripBySlug(slug);

      return res.status(200).json({
        success: true,
        data: trip,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const trip = await tripService.createTrip({
        ...req.body,
        creatorId: userId,
      });

      return res.status(201).json({
        success: true,
        data: trip,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const tripsController = new TripsController();
```

### Route Definition

```typescript
// src/routes/trips.routes.ts
import { Router } from 'express';
import { tripsController } from '@/controllers/trips.controller';
import { requireAuth, requireRole } from '@/middleware/auth.middleware';
import { validateTrip } from '@/validators/trip.validator';

const router = Router();

// Public routes
router.get('/', tripsController.getTrips);
router.get('/:slug', tripsController.getTripBySlug);

// Protected routes (require authentication)
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'organizer'),
  validateTrip,
  tripsController.createTrip
);

export default router;
```

### App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import tripsRoutes from '@/routes/trips.routes';
import authRoutes from '@/routes/auth.routes';
import { errorHandler } from '@/middleware/errorHandler.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/trips', tripsRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

---

## 🗄️ Database Access

### Prisma Best Practices

```typescript
// ✅ Good: Batch operations
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@test.com' },
    { email: 'user2@test.com' },
  ],
  skipDuplicates: true,
});

// ✅ Good: Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    bookings: true,
  },
  take: 10,
});

// ✅ Good: Include relations efficiently
const trips = await prisma.trip.findMany({
  include: {
    bookings: {
      select: { id: true, status: true },
    },
  },
});

// ❌ Bad: Fetch all fields unnecessarily
const users = await prisma.user.findMany();

// ❌ Bad: N+1 query problem
const trips = await prisma.trip.findMany();
const bookings = await Promise.all(
  trips.map(t => prisma.booking.findMany({ where: { tripId: t.id } }))
);

// ✅ Good: Use include to avoid N+1
const trips = await prisma.trip.findMany({
  include: { bookings: true },
});
```

### Transactions

```typescript
// Use transactions for multi-step operations
async function completeBooking(bookingId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update booking status
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
    });

    // 2. Decrement available spots
    await tx.trip.update({
      where: { id: booking.tripId },
      data: { availableSpots: { decrement: booking.numPeople } },
    });

    // 3. Create notification
    const notification = await tx.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking_confirmed',
        data: { bookingId },
      },
    });

    return { booking, notification };
  });

  return result;
}
```

---

## ⚠️ Error Handling

### Custom Error Classes

```typescript
// src/types/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Unauthorized', 'UNAUTHORIZED');
  }
}
```

### Error Handler Middleware

```typescript
// src/middleware/errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/types/errors';
import { logger } from '@/utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
      });
    }
    if ((error as any).code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Unique constraint violation',
      });
    }
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
```

---

## ✅ Validation

### Schema Validation

```typescript
// src/validators/booking.validator.ts
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateBooking = [
  body('tripId')
    .notEmpty().withMessage('Trip ID is required')
    .isString().withMessage('Trip ID must be string'),
  body('numPeople')
    .notEmpty().withMessage('Number of people is required')
    .isInt({ min: 1, max: 50 }).withMessage('Must be 1-50 people'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('specialRequests')
    .optional()
    .isString().withMessage('Special requests must be string')
    .trim(),
  // Middleware to handle validation errors
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => ({
          field: e.param,
          message: e.msg,
        })),
      });
    }
    next();
  },
];

// Usage in routes
router.post('/bookings', validateBooking, createBookingController);
```

---

## 🔐 Authentication & Authorization

### JWT Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/types/errors';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.some(role => req.user!.roles.includes(role))) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}
```

### Generate Tokens

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export function generateToken(payload: {
  id: string;
  email: string;
  roles: string[];
}) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
}

export function generateRefreshToken(payload: { id: string }) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}
```

---

## 🧪 Testing

### Service Testing

```typescript
// src/services/__tests__/trip.service.test.ts
import { TripService } from '../trip.service';
import { prisma } from '@/config/database';

jest.mock('@/config/database');

describe('TripService', () => {
  let tripService: TripService;

  beforeEach(() => {
    tripService = new TripService();
    jest.clearAllMocks();
  });

  describe('getTrips', () => {
    it('returns paginated trips', async () => {
      const mockTrips = [
        { id: '1', title: 'Trip 1', price: 1000 },
        { id: '2', title: 'Trip 2', price: 2000 },
      ];

      (prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips);
      (prisma.trip.count as jest.Mock).mockResolvedValue(2);

      const result = await tripService.getTrips({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockTrips);
      expect(result.pagination.total).toBe(2);
    });

    it('throws error when trip not found', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tripService.getTripBySlug('invalid')).rejects.toThrow(
        'Trip not found'
      );
    });
  });
});
```

### API Endpoint Testing

```typescript
// src/controllers/__tests__/trips.controller.test.ts
import request from 'supertest';
import app from '@/app';
import { tripService } from '@/services/trip.service';

jest.mock('@/services/trip.service');

describe('Trips API', () => {
  describe('GET /api/trips', () => {
    it('returns list of trips', async () => {
      const mockTrips = [
        { id: '1', title: 'Trip 1' },
      ];

      (tripService.getTrips as jest.Mock).mockResolvedValue({
        data: mockTrips,
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

      const res = await request(app).get('/api/trips');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockTrips);
    });
  });
});
```

---

## 🛠️ Common Tasks

### Add New Endpoint

```typescript
// 1. Create validator: src/validators/comment.validator.ts
export const validateComment = [
  body('text').notEmpty().withMessage('Comment text required'),
  body('tripId').notEmpty().withMessage('Trip ID required'),
];

// 2. Create service method: src/services/comment.service.ts
async createComment(tripId: string, userId: string, text: string) {
  return prisma.comment.create({
    data: { tripId, userId, text },
  });
}

// 3. Create controller: src/controllers/comments.controller.ts
async createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.createComment(
      req.body.tripId,
      req.user!.id,
      req.body.text
    );
    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
}

// 4. Add route: src/routes/comments.routes.ts
router.post('/', requireAuth, validateComment, createComment);
```

### Add Background Job

```typescript
// 1. Define queue: src/config/redis.ts
export const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

// 2. Create job handler: src/jobs/email.job.ts
emailQueue.process(async (job) => {
  const { to, template, variables } = job.data;
  await sendEmail(to, template, variables);
});

// 3. Enqueue from service:
await emailQueue.add(
  {
    to: user.email,
    template: 'booking-confirmation',
    variables: { bookingId },
  },
  { delay: 1000 }
);
```

---

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [RESTful API Design](https://restfulapi.net/)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
