# Param Adventures API

Core backend services for the Param Adventures platform.

## 🚀 Stack

- **Framework**: Express (TypeScript)
- **ORM**: Prisma (PostgreSQL)
- **Auth**: JWT (Custom implementation with Refresh Tokens)
- **Payments**: Razorpay Node SDK
- **Logging**: Winston + Morgan

## 🛠️ Key Components

### Authentication & RBAC

- **RequireAuth**: Middleware for JWT validation.
- **Permission Matrix**: Fine-grained permissions loaded at runtime based on user roles.
- **Role Hierarchy**: Supports `SUPER_ADMIN`, `ADMIN`, `TRIP_MANAGER`, `TRIP_GUIDE`, `UPLOADER`, and `USER`.

### Trip Management

- State-driven lifecycle: `DRAFT` -> `PENDING_REVIEW` -> `APPROVED` -> `PUBLISHED`.
- Operational tracking: `IN_PROGRESS`, `COMPLETED`.
- Assignment logic for Managers and Guides.

### Billing & Payments

- Razorpay order creation and signature verification.
- Webhook handling for asynchronous payment events (Captured, Failed, Refunded).

## 🧑‍💻 Development

### Setup

1. Ensure `.env` is configured (see `.env.example`).
2. Generate Prisma client: `npx prisma generate`.
3. Run migrations: `npx prisma migrate dev`.
4. Seed initial roles/permissions: `npm run seed`.
5. Seed test users: `npm run seed:users`.

### Running

```bash
npm run dev     # Development mode with hot-reload
npm run build   # Compile to dist
npm run start   # Run production build
```

## 🏗️ Architecture Notes

- All database interactions must use the shared `prisma` instance from `src/lib/prisma.ts`.
- Business logic is concentrated in controllers (`src/controllers`).
- Middlewares handle shared concerns like Auth, Permissions, and Error Reporting.
