# Database Schema Documentation - Param Adventures

Complete reference for the PostgreSQL database schema.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables](#tables)
4. [Relationships](#relationships)
5. [Indexes](#indexes)

---

## 🎯 Overview

**Database**: PostgreSQL 14+  
**ORM**: Prisma  
**Schema Location**: `apps/api/prisma/schema.prisma`  
**Migrations**: `apps/api/prisma/migrations/`

### Key Principles

- ✅ Normalization: 3NF compliance (mostly)
- ✅ ACID: All transactions ACID-compliant
- ✅ Referential Integrity: Foreign key constraints enforced
- ✅ Temporal Data: `createdAt` and `updatedAt` timestamps
- ✅ Soft Deletes: Using `deletedAt` for non-critical data

---

## 📑 Tables

### User

Stores user account information.

```prisma
model User {
  id            String     @id @default(uuid())
  email         String     @unique
  password      String
  name          String
  nickname      String?
  bio           String?
  age           Int?
  gender        String?
  phoneNumber   String?
  address       String?
  status        UserStatus @default(ACTIVE)
  statusReason  String?
  preferences   Json?      @default("{}")
  googleId      String?    @unique
  avatarUrl     String?
  avatarImageId String?

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?
}
```

**Enums**: `ACTIVE`, `SUSPENDED`, `BANNED`

### Role

Stores role definitions for RBAC.

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Permission

Stores permission definitions.

```prisma
model Permission {
  id          String   @id @default(uuid())
  key         String   @unique
  description String?
  category    String?
  createdAt   DateTime @default(now())
}
```

### UserRole

Junction table for User ↔ Role.

```prisma
model UserRole {
  userId String
  roleId String
}
```

### RolePermission

Junction table for Role ↔ Permission.

```prisma
model RolePermission {
  roleId       String
  permissionId String
}
```

### AuditLog

Stores system audit logs.

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  actorId    String?
  action     String
  targetType String
  targetId   String?
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

### Trip

Stores trip/adventure information.

```prisma
model Trip {
  id                 String       @id @default(uuid())
  title              String
  slug               String       @unique
  description        String
  itinerary          Json
  durationDays       Int
  difficulty         String
  location           String
  price              Int
  status             TripStatus   @default(DRAFT)
  category           TripCategory @default(TREK)

  // Detailed Fields
  startPoint         String?
  endPoint           String?
  altitude           String?
  distance           String?
  itineraryPdf       String?
  highlights         Json?
  inclusions         Json?
  exclusions         Json?
  cancellationPolicy Json?
  thingsToPack       Json?
  faqs               Json?
  seasons            Json?

  // Media
  coverImageId       String?
  heroImageId        String?

  // Management
  createdById        String
  approvedById       String?
  managerId          String?

  capacity           Int          @default(0)
  startDate          DateTime?
  endDate            DateTime?
  publishedAt        DateTime?
  isFeatured         Boolean      @default(false)
  documentation      Json?

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
  deletedAt          DateTime?
}
```

**Enums**:
- **TripStatus**: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`
- **TripCategory**: `TREK`, `CAMPING`, `CORPORATE`, `EDUCATIONAL`, `SPIRITUAL`, `CUSTOM`

### TripGalleryImage

Junction table for Trip Gallery Images.

```prisma
model TripGalleryImage {
  tripId  String
  imageId String
  order   Int
}
```

### TripsOnGuides

Junction table for Trip ↔ Guide (User).

```prisma
model TripsOnGuides {
  tripId     String
  guideId    String
  assignedAt DateTime @default(now())
}
```

### Blog

Stores blog posts.

```prisma
model Blog {
  id           String     @id @default(uuid())
  title        String
  slug         String     @unique
  excerpt      String?
  content      Json       // editor output
  theme        String?    @default("modern")
  status       BlogStatus @default(DRAFT)
  authorId     String
  coverImageId String?
  tripId       String?

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  deletedAt    DateTime?
}
```

**Enums**: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED`

### Image

Stores media files (replacing deprecated Media table).

```prisma
model Image {
  id           String    @id @default(uuid())
  originalUrl  String
  mediumUrl    String
  thumbUrl     String
  width        Int
  height       Int
  size         Int
  mimeType     String
  type         MediaType @default(IMAGE)
  duration     Int?
  uploadedById String

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

**Enums**: `IMAGE`, `VIDEO`

### Booking

Stores booking transactions.

```prisma
model Booking {
  id            String               @id @default(uuid())
  userId        String
  tripId        String
  status        BookingStatus        @default(REQUESTED)
  notes         String?
  startDate     DateTime
  guests        Int                  @default(1)
  guestDetails  Json?                // Array of { name, email, age, gender }
  totalPrice    Int
  paymentStatus BookingPaymentStatus @default(PENDING)

  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
}
```

**Enums**:
- **BookingStatus**: `REQUESTED`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`
- **BookingPaymentStatus**: `PENDING`, `PAID`, `FAILED`

### Payment

Stores payment transaction records.

```prisma
model Payment {
  id                String        @id @default(uuid())
  bookingId         String
  provider          String        // "razorpay"
  providerOrderId   String        @unique
  providerPaymentId String?       @unique
  razorpayRefundId  String?       @unique
  rawPayload        Json?
  proofUrl          String?
  amount            Int
  currency          String        @default("INR")
  method            PaymentMethod?
  refundedAmount    Int           @default(0)
  disputeId         String?
  status            PaymentStatus @default(CREATED)

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

**Enums**:
- **PaymentStatus**: `CREATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`
- **PaymentMethod**: `CARD`, `UPI`, `NETBANKING`, `WALLET`, `OTHER`

### HeroSlide

Stores home page hero slides.

```prisma
model HeroSlide {
  id       String  @id @default(uuid())
  title    String
  subtitle String?
  videoUrl String
  ctaLink  String?
  order    Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Review

Stores user reviews.

```prisma
model Review {
  id        String   @id @default(uuid())
  rating    Int
  comment   String?
  userId    String
  tripId    String
  createdAt DateTime @default(now())
}
```

### SavedTrip

Stores wishlist/saved trips.

```prisma
model SavedTrip {
  userId    String
  tripId    String
  createdAt DateTime @default(now())
}
```

### SiteConfig

Stores dynamic site configuration.

```prisma
model SiteConfig {
  key   String @id
  value String
  label String
}
```

### TripInquiry

Stores custom trip inquiries.

```prisma
model TripInquiry {
  id          String            @id @default(uuid())
  name        String
  email       String
  phoneNumber String?
  destination String
  dates       String?
  budget      String?
  details     String?
  status      TripInquiryStatus @default(NEW)
  createdAt   DateTime          @default(now())
}
```

**Enums**: `NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`

### NewsletterSubscriber

Stores newsletter subscriptions.

```prisma
model NewsletterSubscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

---

## 🔗 Relationships

### One-to-One (1:1)

- **Booking ↔ Payment** (via `bookingId`, one payment history per booking generally, though schema allows multiple Payments pointing to Booking, but typically one active)
- **User ↔ Image** (Avatar)
- **Trip ↔ Image** (Cover, Hero)
- **Blog ↔ Image** (Cover)

### One-to-Many (1:M)

- **User → Bookings**
- **User → Reviews**
- **User → Blogs**
- **User → Images** (UploadedBy)
- **Trip → Bookings**
- **Trip → Reviews**
- **Trip → Blogs**
- **Role → UserRoles**
- **Permission → RolePermissions**

### Many-to-Many (M:M)

- **User ↔ Role** (via `UserRole`)
- **Role ↔ Permission** (via `RolePermission`)
- **User ↔ Trip** (Guides via `TripsOnGuides`)
- **Trip ↔ Image** (Gallery via `TripGalleryImage`)
- **User ↔ Trip** (SavedTrips via `SavedTrip`)

---

## 📑 Indexes

Extensive indexing is used on foreign keys, status fields, and frequently searched columns (e.g., `slug`, `email`, `createdAt`).

---

**Last Updated**: January 2026
**Version**: 1.1.0
