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

---

## 🔑 Demo Credentials

**Test Accounts (Password: `password123`)**
- `superadmin@local.test` (Full System Control)
- `admin@local.test` (Standard Admin)
- `uploader@local.test` (Trip Management)
- `user@local.test` (Standard Member)

---

## 🛠️ Architecture

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Custom JWT (Access + Refresh tokens)

## 🛡️ Security Notes

- Staging/Production environments use HTTP-only cookies.
- Stack traces are suppressed in production.
- Rate limiting and CORS are configured for specific client origins.
