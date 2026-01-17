# Performance Tuning Guide - Param Adventures

Strategies for optimizing system performance.

---

## 📋 Performance Metrics

### Target Benchmarks

| Metric            | Target  | Current |
| ----------------- | ------- | ------- |
| API Response Time | < 200ms | Monitor |
| Database Query    | < 100ms | Monitor |
| Frontend Load     | < 2s    | Monitor |
| Lighthouse Score  | > 90    | Monitor |
| Cache Hit Rate    | > 80%   | Monitor |
| Memory Usage      | < 500MB | Monitor |

---

## 🚀 Quick Wins

### 1. Enable Caching

```env
# apps/api/.env
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379
```

```typescript
// src/services/TripService.ts
import { Redis } from "ioredis";

class TripService {
  constructor(private redis: Redis) {}

  async getTrip(id: string) {
    const cached = await this.redis.get(`trip:${id}`);
    if (cached) return JSON.parse(cached);

    const trip = await prisma.trip.findUnique({ where: { id } });
    await this.redis.setex(`trip:${id}`, 3600, JSON.stringify(trip));
    return trip;
  }
}
```

### 2. Database Indexes

```prisma
// prisma/schema.prisma
model Trip {
  id String @id @default(cuid())
  slug String @unique  // ✅ Indexed for fast lookups
  category String
  location String
  createdAt DateTime @default(now())

  @@index([category])
  @@index([location])
  @@index([createdAt])
}

model Booking {
  id String @id @default(cuid())
  userId String
  tripId String
  status String

  @@index([userId, status])  // Composite index
  @@index([tripId])
}
```

Deploy indexes:

```bash
npx prisma db push
```

### 3. Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const trips = await prisma.trip.findMany();
const bookings = await Promise.all(
  trips.map((t) => prisma.booking.findMany({ where: { tripId: t.id } }))
);

// ✅ Good: Single query with include
const trips = await prisma.trip.findMany({
  include: {
    bookings: true, // Fetches related bookings
  },
});

// ✅ Better: Select only needed fields
const trips = await prisma.trip.findMany({
  select: {
    id: true,
    title: true,
    bookings: {
      select: { id: true, status: true },
    },
  },
});
```

### 4. Pagination

```typescript
// ❌ Bad: Loads all records
const trips = await prisma.trip.findMany();

// ✅ Good: Paginated results
const page = parseInt(req.query.page) || 1;
const limit = 20;
const skip = (page - 1) * limit;

const [trips, total] = await Promise.all([
  prisma.trip.findMany({ skip, take: limit }),
  prisma.trip.count(),
]);

const hasMore = skip + limit < total;
```

---

## 🗄️ Database Optimization

### Query Monitoring

```bash
# Enable query logging
DATABASE_ENABLE_LOGGING=true npm run dev

# View slow queries
psql $DATABASE_URL -c "
  SELECT query, calls, mean_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC LIMIT 10;
"
```

### Connection Pooling

```env
# apps/api/.env
# Increase connection pool
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&pool_size=20&max_overflow=10"

# Or use PgBouncer for external pooling
# This is important in production
```

### Batch Operations

```typescript
// Prisma batch operations
const users = await prisma.user.createMany({
  data: [
    { email: "user1@test.com", password: "hash1" },
    { email: "user2@test.com", password: "hash2" },
    { email: "user3@test.com", password: "hash3" },
  ],
});
```

### Archive Old Data

```typescript
// Archive bookings older than 1 year
const cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

const archivedBookings = await prisma.booking.findMany({
  where: { createdAt: { lt: cutoffDate } },
});

// Move to archive table or delete
await prisma.bookingArchive.createMany({ data: archivedBookings });
await prisma.booking.deleteMany({
  where: { createdAt: { lt: cutoffDate } },
});
```

---

## 💾 Caching Strategy

### Multi-Layer Caching

```
┌─────────────────────────────────────┐
│     Browser Cache (Service Worker)   │ 1-30 days
├─────────────────────────────────────┤
│     HTTP Cache (CDN/Next.js)         │ 1 hour
├─────────────────────────────────────┤
│     Application Cache (Redis)        │ 30 min
├─────────────────────────────────────┤
│     Database Query Cache             │ 5 min
├─────────────────────────────────────┤
│     Database (PostgreSQL)            │ Source
└─────────────────────────────────────┘
```

### Implementation

```typescript
// apps/api/src/middleware/cacheMiddleware.ts
export function cacheMiddleware(ttl: number) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json;
    res.json = function (data) {
      redis.setex(key, ttl, JSON.stringify(data));
      res.setHeader("X-Cache", "MISS");
      return originalJson.call(this, data);
    };

    next();
  };
}

// Usage
app.get("/api/trips", cacheMiddleware(3600), getTripsHandler);
```

### Cache Invalidation

```typescript
// Invalidate cache when data changes
async function updateTrip(id: string, data: Partial<Trip>) {
  const trip = await prisma.trip.update({
    where: { id },
    data,
  });

  // Invalidate related caches
  await redis.del(`trip:${id}`);
  await redis.del(`trips:all`);
  await redis.del(`cache:/api/trips`);

  return trip;
}
```

---

## 🌐 Frontend Performance

### Next.js Optimization

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable SWR (stale-while-revalidate)
  images: {
    unoptimized: false, // Use Image Optimization
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },

  // Compression
  compress: true,

  // Generate sitemap for crawlers
  headers: async () => [
    {
      source: "/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
    },
  ],
};

export default nextConfig;
```

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyMap = dynamic(() => import('./HeavyMap'), {
  loading: () => <div>Loading map...</div>,
});

export default function TripDetail() {
  return (
    <>
      <TripInfo />
      <HeavyMap />  {/* Only loads when needed */}
    </>
  );
}
```

### Image Optimization

```typescript
// Use next/image for automatic optimization
import Image from 'next/image';

<Image
  src="https://res.cloudinary.com/demo/image/fetch/c_scale,w_500/https://example.com/image.jpg"
  alt="Trip"
  width={500}
  height={300}
  priority  // Load above the fold immediately
  quality={75}  // Reduce file size
/>
```

---

## ⚡ API Performance

### Response Compression

```typescript
// apps/api/src/app.ts
import compression from "compression";

app.use(compression()); // Enables gzip compression
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

### Request Timeout

```typescript
// Prevent hanging requests
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});
```

---

## 📊 Monitoring & Profiling

### Application Performance Monitoring

```bash
# Using clinic.js
npm install -g clinic

clinic doctor -- node apps/api/dist/app.js

# Generates report showing bottlenecks
```

### CPU Profiling

```bash
# Generate CPU profile
node --prof apps/api/dist/app.js

# Process profile
node --prof-process isolate-*.log > profile.txt
cat profile.txt | head -50
```

### Memory Profiling

```bash
# Check memory usage
npm install -g heapdump

# In code:
const heapdump = require('heapdump');
setInterval(() => heapdump.writeSnapshot(), 60000);

# Analyze with Chrome DevTools
```

---

## 🔄 Background Jobs

### Job Queue Optimization

```typescript
// Use concurrency to process jobs in parallel
const queue = new Queue("email-queue", {
  connection: redis,
  concurrency: 10, // Process 10 jobs simultaneously
  attempt: 3, // Retry failed jobs 3 times
  backoff: {
    type: "exponential",
    delay: 2000,
  },
});

// Rate limit if external API has limits
queue.setRateLimitOptions({
  max: 100, // Max 100 jobs
  duration: 60000, // Per minute
});
```

### Job Batching

```typescript
// Batch email sends to reduce API calls
async function sendBatchEmails(userIds: string[]) {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  // Send batch instead of individual emails
  await emailProvider.sendBatch(
    users.map((u) => ({
      to: u.email,
      template: "notification",
      variables: { name: u.name },
    }))
  );
}
```

---

## 📈 Scaling Strategies

### Horizontal Scaling

```yaml
# docker-compose.yml - Multiple API instances
version: "3.9"
services:
  api-1:
    build: ./apps/api
    ports:
      - "3001:3001"
  api-2:
    build: ./apps/api
    ports:
      - "3002:3001"
  api-3:
    build: ./apps/api
    ports:
      - "3003:3001"

  nginx: # Load balancer
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database Replication

```bash
# Read replicas for reporting/analytics
REPLICA_DATABASE_URL=postgresql://user:pass@replica:5432/db
```

```typescript
// Use replica for read-heavy operations
const analyticsDb = prisma.$extend({
  client: {
    $queryRaw: (sql) => {
      // Route to replica if available
      if (isReadQuery(sql)) {
        return replicaDb.$queryRaw(sql);
      }
      return originalDb.$queryRaw(sql);
    },
  },
});
```

---

## 🎯 Performance Checklist

- [ ] Database indexes created
- [ ] Query N+1 problems eliminated
- [ ] Pagination implemented
- [ ] Caching strategy deployed
- [ ] Image optimization enabled
- [ ] API compression enabled
- [ ] Rate limiting configured
- [ ] Connection pooling enabled
- [ ] Monitor slow queries
- [ ] Load testing performed
- [ ] CDN configured
- [ ] Job queue optimized

---

## 📚 Additional Resources

- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance.html)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js Optimization](https://nextjs.org/docs/advanced-features/optimizing-fonts)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
