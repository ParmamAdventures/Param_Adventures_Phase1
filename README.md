# Param Adventures

A premium adventure travel platform built for scale.

## 🚀 Quick Start (Demo Mode)

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or local instance)

### 1. Environment Setup

Copy the example configuration files and fill in any missing secrets (Database URL, JWT Secret).

```bash
# API Config
cp apps/api/.env.example apps/api/.env

# Web Config
cp apps/web/.env.example apps/web/.env
```

### 2. Install & Seed

Install dependencies and creating the initial database state.

```bash
# Install root dependencies
npm install

# Setup Database (run from root or apps/api)
cd apps/api
npx prisma generate
npx prisma migrate dev
node prisma/seed_users.js # Seeds demo users
```

### 3. Run Application

Run both frontend and backend concurrently.

```bash
# In Terminal 1 (API)
cd apps/api
npm run dev

# In Terminal 2 (Web)
cd apps/web
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### 4. 🧪 E2E Testing

We use Playwright for End-to-End testing.

#### Setup

```bash
cd apps/e2e
npm install
npx playwright install --with-deps
```

#### Run Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run in UI mode
npx playwright test --ui
```

---

## 🔑 Demo Credentials

**Test Accounts (Password: `password123`)**
- `superadmin@local.test` (Full System Control)
- `admin@local.test` (Standard Admin)
- `uploader@local.test` (Trip Management)
- `manager@local.test` (Operational Manager)
- `guide@local.test` (On-site Guide)
- `user@local.test` (Standard Member)

---

## 🔐 Role & Permission Matrix

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | System Owner | Full access to all features, roles, and settings. |
| **ADMIN** | Moderator | Approve/Publish Trips, Manage Bookings, Moderate Blogs. |
| **TRIP_MANAGER** | Logistics | Assign Guides to Trips, View Guests, Update Trip Status. |
| **TRIP_GUIDE** | On-site | View assigned Trip guests, Update Trip status. |
| **UPLOADER** | Content Creator | Create and Edit Trip drafts, Submit for review. |
| **USER** | Member | Write and Submit Blog posts, View personal dashboard. |
| **PUBLIC** | Visitor | Browse trips, Create bookings (Guest flow). |

---

---

## 🛠️ Architecture

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL & Redis (for queues/real-time)
- **Auth**: Custom JWT (Access + Refresh tokens)
- **Background Jobs**: BullMQ (with automatic retries)
- **Real-time**: Socket.io (with Redis Pub/Sub adapter)
- **Payments**: Razorpay Integration (with server-side HMAC verification)
- **Media**: Local storage with Sharp optimization (S3 compliant future-readiness)

## 🛡️ Security Notes

- Staging/Production environments use HTTP-only cookies.
- Stack traces are suppressed in production.
- Rate limiting and CORS are configured for specific client origins.
