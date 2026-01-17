# Database Schema Documentation - Param Adventures

Complete reference for the PostgreSQL database schema.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables](#tables)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Queries & Performance](#queries--performance)

---

## 🎯 Overview

**Database**: PostgreSQL 14+  
**ORM**: Prisma  
**Schema Location**: `apps/api/prisma/schema.prisma`  
**Migrations**: `apps/api/prisma/migrations/`

### Key Principles

- ✅ Normalization: 3NF compliance
- ✅ ACID: All transactions ACID-compliant
- ✅ Referential Integrity: Foreign key constraints enforced
- ✅ Temporal Data: `createdAt` and `updatedAt` timestamps
- ✅ Soft Deletes: Using `deletedAt` for non-critical data

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │◄────────│   UserRole  │
│             │         │             │
│ • id (PK)   │         │ • userId    │
│ • email     │         │ • roleId    │
│ • password  │         └─────────────┘
│ • name      │                ▲
│ • avatar    │                │ Many-to-Many
│ • status    │         ┌──────┴───────┐
└─────────────┘         │              │
       ▲                ┌▼────────┐  ┌▼────────┐
       │                │  Role   │  │Permission│
       │                │         │  │          │
     1 │                │ • id    │  │ • id     │
       │                │ • name  │  │ • key    │
       │                └─────────┘  └──────────┘
       │
    Booker
       │
┌──────┴──────┐
│   Booking   │
│             │
│ • id (PK)   │
│ • userId    │
│ • tripId    │
│ • status    │
│ • total     │
└──────┬──────┘
       │ 1
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
     * │            * │            * │            * │
    ┌──▼───┐  ┌──────▼──┐  ┌───────▼──┐  ┌────────▼─┐
    │Payment│  │ Review  │  │SavedTrip │  │GuestDetail│
    └───────┘  └─────────┘  └──────────┘  └───────────┘


┌──────────┐
│   Trip   │◄──────┐
│          │       │
│ • id (PK)│       │ Guide
│ • title  │       │ (Many)
│ • price  │   ┌───┴────────┐
│ • guides │   │     User    │
│ • status │   │   (Guides)  │
└──────────┘   └─────────────┘


┌─────────────┐
│    Blog     │
│             │
│ • id (PK)   │
│ • title     │
│ • content   │
│ • status    │
│ • authorId  │───────┐
└─────────────┘       │
                   ┌──▼──┐
                   │User │
                   └─────┘


┌─────────────┐
│   Media     │
│             │
│ • id (PK)   │
│ • url       │
│ • type      │
│ • tripId    │───────┐
└─────────────┘       │
                   ┌──▼──┐
                   │Trip │
                   └─────┘
```

---

## 📑 Tables

### User

Stores user account information.

```
CREATE TABLE "User" (
  id              String  @id @default(cuid())
  email           String  @unique
  password        String
  name            String
  avatar          String?
  bio             String?
  phone           String?
  status          String  @default("ACTIVE")
  emailVerified   Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
)
```

**Indexes**:

- `email` (unique)
- `status`
- `createdAt`

**Relationships**:

- `bookings` (1:Many) → Booking
- `reviews` (1:Many) → Review
- `blogs` (1:Many) → Blog
- `guideTrips` (Many:Many) → Trip
- `savedTrips` (1:Many) → SavedTrip
- `userRoles` (1:Many) → UserRole
- `notifications` (1:Many) → Notification

**Enums**:

- `ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`

---

### Trip

Stores trip/adventure information.

```
CREATE TABLE "Trip" (
  id              String  @id @default(cuid())
  slug            String  @unique
  title           String
  description     String
  shortDescription String?
  location        String
  difficulty      String  @default("MODERATE")
  durationDays    Int
  price           Int
  totalSpots      Int
  availableSpots  Int
  image           String?
  itinerary       Json
  status          String  @default("DRAFT")
  seoKeywords     String[]
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
)
```

**Indexes**:

- `slug` (unique)
- `status`
- `location`
- `difficulty`
- `createdAt`

**Relationships**:

- `guides` (Many:Many) → User
- `bookings` (1:Many) → Booking
- `reviews` (1:Many) → Review
- `media` (1:Many) → Media
- `savedTrips` (1:Many) → SavedTrip

**Enums**:

- `DRAFT`, `PUBLISHED`, `ARCHIVED`, `CANCELLED`

**Difficulty Levels**:

- `EASY`, `MODERATE`, `DIFFICULT`, `EXTREME`

---

### Booking

Stores booking transactions.

```
CREATE TABLE "Booking" (
  id              String  @id @default(cuid())
  bookingRef      String  @unique
  userId          String
  tripId          String
  status          String  @default("PENDING")
  totalPrice      Int
  pricePerPerson  Int
  numPeople       Int
  checkInDate     DateTime
  checkOutDate    DateTime
  specialRequests String?
  refundedAmount  Int     @default(0)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
}
```

**Indexes**:

- `bookingRef` (unique)
- `userId`
- `tripId`
- `status`
- `checkInDate`
- `createdAt`

**Relationships**:

- `user` → User
- `trip` → Trip
- `payment` (1:1) → Payment
- `reviews` (1:Many) → Review
- `guestDetails` (1:Many) → GuestDetail

**Enums**:

- `PENDING`, `CONFIRMED`, `PAID`, `CANCELLED`, `COMPLETED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`

---

### Payment

Stores payment transaction records.

```
CREATE TABLE "Payment" (
  id              String  @id @default(cuid())
  bookingId       String  @unique
  orderId         String  @unique
  paymentId       String?
  status          String  @default("PENDING")
  amount          Int
  method          String?
  refundedAmount  Int     @default(0)
  refunds         Json[]
  disputeId       String?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Indexes**:

- `bookingId` (unique)
- `orderId` (unique)
- `paymentId`
- `status`
- `createdAt`

**Relationships**:

- `booking` → Booking

**Enums**:

- `PENDING`, `INITIATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`

**Methods**: `upi`, `card`, `netbanking`, `wallet`, etc.

---

### Review

Stores user reviews and ratings.

```
CREATE TABLE "Review" (
  id              String  @id @default(cuid())
  bookingId       String  @unique
  userId          String
  tripId          String
  rating          Int
  title           String
  comment         String?
  status          String  @default("PENDING")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Indexes**:

- `bookingId` (unique)
- `userId`
- `tripId`
- `rating`
- `status`
- `createdAt`

**Relationships**:

- `user` → User
- `trip` → Trip
- `booking` → Booking

**Enums**:

- `PENDING`, `APPROVED`, `REJECTED`

**Rating Range**: 1-5 stars

---

### Role

Stores role definitions for RBAC.

```
CREATE TABLE "Role" (
  id              String  @id @default(cuid())
  name            String  @unique
  description     String?
  permissions     Json
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Indexes**:

- `name` (unique)

**Relationships**:

- `userRoles` (1:Many) → UserRole

**Predefined Roles**:

- `admin`: Full system access
- `guide`: Can manage assigned trips
- `user`: Regular user (default)
- `moderator`: Can moderate reviews/blogs

---

### Permission

Stores permission definitions.

```
CREATE TABLE "Permission" (
  id              String  @id @default(cuid())
  key             String  @unique
  description     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Indexes**:

- `key` (unique)

**Example Permissions**:

- `user:list`, `user:create`, `user:update`, `user:delete`
- `trip:list`, `trip:publish`, `trip:delete`
- `booking:list`, `booking:cancel`, `booking:refund`
- `payment:view`, `payment:refund`
- `blog:create`, `blog:publish`, `blog:reject`
- `analytics:view`, `admin:dashboard`

---

### UserRole

Junction table for User ↔ Role (Many:Many).

```
CREATE TABLE "UserRole" (
  id              String  @id @default(cuid())
  userId          String
  roleId          String
  createdAt       DateTime @default(now())

  @@unique([userId, roleId])
}
```

**Indexes**:

- `userId`
- `roleId`
- `[userId, roleId]` (unique composite)

---

### SavedTrip

Stores user's saved/wishlist trips.

```
CREATE TABLE "SavedTrip" {
  id              String  @id @default(cuid())
  userId          String
  tripId          String
  createdAt       DateTime @default(now())

  @@unique([userId, tripId])
}
```

**Indexes**:

- `userId`
- `tripId`
- `[userId, tripId]` (unique composite)

---

### GuestDetail

Stores guest information for bookings.

```
CREATE TABLE "GuestDetail" {
  id              String  @id @default(cuid())
  bookingId       String
  name            String
  email           String
  phone           String
  age             Int?
  specialNeeds    String?
  createdAt       DateTime @default(now())
}
```

**Indexes**:

- `bookingId`

---

### Blog

Stores blog posts.

```
CREATE TABLE "Blog" {
  id              String  @id @default(cuid())
  slug            String  @unique
  title           String
  content         String
  excerpt         String?
  authorId        String
  status          String  @default("DRAFT")
  featured        Boolean @default(false)
  views           Int     @default(0)
  seoKeywords     String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
  deletedAt       DateTime?
}
```

**Indexes**:

- `slug` (unique)
- `authorId`
- `status`
- `createdAt`

**Enums**:

- `DRAFT`, `PUBLISHED`, `REJECTED`, `ARCHIVED`

---

### Media

Stores media files for trips.

```
CREATE TABLE "Media" {
  id              String  @id @default(cuid())
  tripId          String
  url             String
  type            String
  alt             String?
  order           Int     @default(0)
  createdAt       DateTime @default(now())
}
```

**Indexes**:

- `tripId`
- `order`

---

### Notification

Stores user notifications.

```
CREATE TABLE "Notification" {
  id              String  @id @default(cuid())
  userId          String
  type            String
  title           String
  message         String
  data            Json?
  read            Boolean @default(false)
  createdAt       DateTime @default(now())
}
```

**Indexes**:

- `userId`
- `read`
- `createdAt`

---

## 🔗 Relationships

### One-to-One (1:1)

| Relationship          | Table 1 | Table 2 | Foreign Key | Notes                                    |
| --------------------- | ------- | ------- | ----------- | ---------------------------------------- |
| **Booking ↔ Payment** | Booking | Payment | `bookingId` | Each booking has one payment record      |
| **Booking ↔ Review**  | Booking | Review  | `bookingId` | One review per booking (soft constraint) |

### One-to-Many (1:M)

| Relationship               | Parent  | Child        | Foreign Key | Notes                                |
| -------------------------- | ------- | ------------ | ----------- | ------------------------------------ |
| **User → Bookings**        | User    | Booking      | `userId`    | User creates multiple bookings       |
| **User → Reviews**         | User    | Review       | `userId`    | User writes multiple reviews         |
| **User → Blogs**           | User    | Blog         | `authorId`  | User authors multiple blogs          |
| **Trip → Bookings**        | Trip    | Booking      | `tripId`    | Trip has multiple bookings           |
| **Trip → Reviews**         | Trip    | Review       | `tripId`    | Trip receives multiple reviews       |
| **Trip → Media**           | Trip    | Media        | `tripId`    | Trip has multiple media files        |
| **Booking → GuestDetails** | Booking | GuestDetail  | `bookingId` | Booking has multiple guests          |
| **Role → UserRoles**       | Role    | UserRole     | `roleId`    | Role assigned to multiple users      |
| **User → Notifications**   | User    | Notification | `userId`    | User receives multiple notifications |

### Many-to-Many (M:M)

| Relationship             | Table 1 | Table 2 | Junction Table | Notes                                                    |
| ------------------------ | ------- | ------- | -------------- | -------------------------------------------------------- |
| **User ↔ Role**          | User    | Role    | UserRole       | User has multiple roles, role assigned to multiple users |
| **User ↔ Trip (Guides)** | User    | Trip    | (Implicit)     | Multiple guides per trip, user guides multiple trips     |
| **User ↔ Trip (Saved)**  | User    | Trip    | SavedTrip      | User saves multiple trips, trip saved by multiple users  |

---

## 📑 Indexes

### Performance Indexes

```sql
-- User indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_status ON "User"(status);
CREATE INDEX idx_user_created_at ON "User"("createdAt");

-- Trip indexes
CREATE INDEX idx_trip_slug ON "Trip"(slug);
CREATE INDEX idx_trip_status ON "Trip"(status);
CREATE INDEX idx_trip_location ON "Trip"(location);
CREATE INDEX idx_trip_difficulty ON "Trip"(difficulty);
CREATE INDEX idx_trip_created_at ON "Trip"("createdAt");

-- Booking indexes
CREATE INDEX idx_booking_ref ON "Booking"("bookingRef");
CREATE INDEX idx_booking_user_id ON "Booking"("userId");
CREATE INDEX idx_booking_trip_id ON "Booking"("tripId");
CREATE INDEX idx_booking_status ON "Booking"(status);
CREATE INDEX idx_booking_check_in ON "Booking"("checkInDate");
CREATE INDEX idx_booking_created_at ON "Booking"("createdAt");

-- Payment indexes
CREATE INDEX idx_payment_booking_id ON "Payment"("bookingId");
CREATE INDEX idx_payment_order_id ON "Payment"("orderId");
CREATE INDEX idx_payment_status ON "Payment"(status);
CREATE INDEX idx_payment_created_at ON "Payment"("createdAt");

-- Review indexes
CREATE INDEX idx_review_booking_id ON "Review"("bookingId");
CREATE INDEX idx_review_user_id ON "Review"("userId");
CREATE INDEX idx_review_trip_id ON "Review"("tripId");
CREATE INDEX idx_review_rating ON "Review"(rating);
CREATE INDEX idx_review_status ON "Review"(status);

-- Blog indexes
CREATE INDEX idx_blog_slug ON "Blog"(slug);
CREATE INDEX idx_blog_author_id ON "Blog"("authorId");
CREATE INDEX idx_blog_status ON "Blog"(status);
CREATE INDEX idx_blog_created_at ON "Blog"("createdAt");

-- Notification indexes
CREATE INDEX idx_notification_user_id ON "Notification"("userId");
CREATE INDEX idx_notification_read ON "Notification"(read);
CREATE INDEX idx_notification_created_at ON "Notification"("createdAt");
```

### Composite Indexes

```sql
-- UserRole unique constraint
CREATE UNIQUE INDEX idx_user_role_unique ON "UserRole"("userId", "roleId");

-- SavedTrip unique constraint
CREATE UNIQUE INDEX idx_saved_trip_unique ON "SavedTrip"("userId", "tripId");

-- GuestDetail lookup
CREATE INDEX idx_guest_detail_booking_id ON "GuestDetail"("bookingId");

-- Booking date range queries
CREATE INDEX idx_booking_date_range ON "Booking"("checkInDate", "checkOutDate");

-- Payment refund tracking
CREATE INDEX idx_payment_refund_amount ON "Payment"("refundedAmount");
```

---

## 🚀 Queries & Performance

### Common Query Patterns

**Get booking with all details**:

```prisma
const booking = await prisma.booking.findUnique({
  where: { id: bookingId },
  include: {
    user: true,
    trip: { include: { media: true } },
    payment: true,
    guestDetails: true,
    reviews: true
  }
});
```

**Get user with roles and permissions**:

```prisma
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    userRoles: {
      include: { role: { include: { permissions: true } } }
    }
  }
});
```

**Get trip with analytics**:

```prisma
const [bookings, reviews, savedCount] = await Promise.all([
  prisma.booking.count({ where: { tripId } }),
  prisma.review.findMany({ where: { tripId } }),
  prisma.savedTrip.count({ where: { tripId } })
]);
```

### N+1 Query Prevention

✅ **Good** - Use `include` for related data:

```prisma
const trips = await prisma.trip.findMany({
  include: { reviews: true, media: true }
});
```

❌ **Bad** - Loop and query individually:

```prisma
const trips = await prisma.trip.findMany();
trips.forEach(async (trip) => {
  trip.reviews = await prisma.review.findMany({ where: { tripId: trip.id } });
});
```

### Query Performance Tips

1. **Always include foreign key filters** in WHERE clauses
2. **Use pagination** for large result sets
3. **Avoid selecting all columns** - select only needed fields
4. **Cache frequently accessed data** (trips, users) in Redis
5. **Use database-level aggregates** instead of application logic

---

## 📚 Additional Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Indexing Guide](https://www.postgresql.org/docs/current/indexes.html)
- [Database Normalization](https://www.postgresql.org/docs/current/normalize.html)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
