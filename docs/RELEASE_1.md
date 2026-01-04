# Release 1.0 Specification: Param Adventures

**Product Name:** Param Adventures
**Version:** 1.0.0 (Phase 1)
**Release Date:** 2026-01-05

## 1. Overview
Param Adventures is a premium adventure travel platform enabling users to discover, book, and review curated expeditions (treks, corporate, educational, spiritual). It features a full-featured management backend for admins and trip managers.

## 2. In-Scope Features

### User Features (Frontend)
- **Authentication**: Sign Up, Login, Google OAuth, Password Reset.
- **Discovery**:
  - Hero carousel with featured trips.
  - Categorized trip feeds (Trek, Corporate, Educational, Spiritual).
  - Search and filter functionality.
  - Detailed Trip pages with itinerary, pricing, and inclusions.
- **Booking & Payments**:
  - Trip booking flow.
  - Razorpay payment gateway integration.
  - Booking history (`My Bookings`).
- **Engagement**:
  - Wishlist management.
  - Trip Reviews and Ratings.
  - Blog/Journal consumption.
  - Newsletter subscription.
- **Profile**: User profile management (Avatar, Bio, Preferences).

### Admin & Management Features (Backend/Dashboard)
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for platform management.
- **Trip Management**: Create, Update, Delete trips with approval workflows (Draft -> Published).
- **Booking Management**: View and manage user bookings.
- **Content Management**:
  - Blog publishing.
  - Media library (Cloudinary integration).
  - Site configuration (Hero slides).
- **Analytics**: Basic dashboard metrics and audit logs.

## 3. Supported User Roles
- **SUPER_ADMIN**: Full system access, role management, and sensitive operations.
- **ADMIN**: General platform management (Users, Trips, Content).
- **TRIP_MANAGER**: Oversees trip logistics and assignments.
- **TRIP_GUIDE**: Assigned to specific trips (view-only/logistics access).
- **UPLOADER**: Access to media upload and content management only.
- **USER**: Standard platform customer (Browsing, Booking, Reviewing).

## 4. Architecture & Stack
- **Frontend**: Next.js 14 (App Router & Pages Router hybrid), Tailwind CSS.
- **Backend**: Node.js/Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL.
- **Infrastructure**: Redis (Caching/Queues), Docker support.

## 5. Known Limitations
- **Mobile Support**: The web application is responsive but lacks a native mobile app.
- **Legacy Code**: Contains a mixture of Next.js App Router and Pages Router (`src/pages`), pending cleanup.
- **Offline Mode**: No offline support or PWA capabilities implemented.
- **Payment Currency**: Restricted to INR (Razorpay default).

## 6. Out-of-Scope / Non-Goals
- **Flights & Hotels**: Creating separate bookings for flights or hotels is not supported; strictly focused on comprehensive "Trips".
- **Social Network**: User-to-user messaging or social feeds are not part of Phase 1.
- **Native Apps**: iOS and Android applications are out of scope.
- **Multi-tenant SaaS**: The platform is a single-tenant instance for Param Adventures.
