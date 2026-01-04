# System Architecture Audit
**Date:** 2026-01-05
**Scope:** Entire Repository (`apps/api`, `apps/web`)

## 1. High-Level System Overview
The system is a monorepo-style setup containing two primary applications:
- **`apps/api`**: A Node.js/Express REST API using Prisma (PostgreSQL) and Redis.
- **`apps/web`**: A Next.js frontend application (React).

The codebase structure is relatively flat with no shared logic packages detected (e.g., no `packages/ui` or `packages/types`), implying potential duplication of types/constants.

## 2. Frontend Architecture (`apps/web`)
- **Framework**: Next.js 14+ (App Router).
- **State/Routing**:
  - Primary routing uses the **App Router** (`src/app`).
  - **Legacy/Zombie Code**: A `src/pages` directory exists containing `Login.tsx`, `Signup.tsx`, and `_app.tsx`. This conflicts with `src/app` and is likely unused/dead code.
- **Styling**: Tailwind CSS (`globals.css`).
- **Data Fetching**: Server Components directly fetching from API (e.g., `getTrips` in `page.tsx`).
- **Monitoring**: Sentry is integrated (`next.config.ts`, `sentry.*.config.ts`).

## 3. Backend Architecture (`apps/api`)
- **Framework**: Express.js with TypeScript.
- **Database**: Prisma ORM with PostgreSQL.
- **Architecture Pattern**: Layered (Route -> Controller -> Service -> DAL/Prisma).
  - **Routes**: Defined in `src/routes`, mounting middleware.
  - **Controllers**: Handle HTTP, validation, and response formatting (e.g., `user.controller.ts`).
  - **Services**: Encapsulate business logic (e.g., `user.service.ts` handles logic like `hasPermission`).
- **Security**: Helmet, Rate Limiting (global & route-specific), CORS, Passport (Google OAuth), custom JWT middleware.
- **Queue**: BullMQ with Redis for background jobs (notifications).

## 4. Shared Patterns & Anti-Patterns
### Patterns
- **Service Layer**: Good use of Service classes/singletons to isolate business logic from controllers.
- **Centralized Config**: Environment variables are typed and validated in `config/env.ts` (implied). Client instances (`prisma`, `redis`) are singletons in `lib/`.
- **Async Handling**: Consistent use of `catchAsync` wrapper for controller error handling.

### Anti-Patterns
- **Type Casting**: Heavy use of `as any` in controllers (e.g., `(req as any).user`). The `Request` type should be extended globally to include `user`.
- **Hardcoded Fallbacks**: Production code (e.g., `server.ts`) contains fallbacks like `|| 3000` or `|| "http://localhost:3000"`, which can be dangerous if environment variables are missing.
- **Inconsistent Naming**:
  - `src/middleware` (singular, 1 file) vs `src/middlewares` (plural, 8 files).
  - `mediaUpload.controller.ts` (file) vs `media/` (directory of controllers).

## 5. Areas with Duplicated Code
- **Middleware Folders**: `apps/api/src/middleware` vs `apps/api/src/middlewares`. Both contain valid middleware.
- **Legacy Frontend Pages**: `apps/web/src/pages` likely duplicates functionality found in `apps/web/src/app` (e.g., Login/Signup).

## 6. Areas with Unclear Responsibility
- **Controller Granularity**:
  - Mix of entity-based controllers (`user`, `trips`) and functional controllers (`paymentEvents`, `razorpayWebhook`).
  - `mediaUpload.controller.ts` sits outside the `media/` folder which contains other media controllers.
- **Admin Routing**: Admin routes are separated (`src/routes/admin/*`) which is good, but file structure within `controllers` mixes admin and user logic in some places or separates them inconsistently.
