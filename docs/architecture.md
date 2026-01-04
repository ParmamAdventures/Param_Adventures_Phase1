# System Architecture

## 1. System Overview

Param Adventures follows a modern **Monorepo** architecture, housing both the frontend and backend in a single repository to ensure type safety, unified configuration, and streamlined development.

```mermaid
graph TD
    Client[User Client \n(Browser/Mobile)] -->|HTTPS| Web[Frontend App \n(Next.js)]
    Client -->|HTTPS / API| API[Backend API \n(Express)]
    
    Web -->|SSR/Client Fetch| API
    
    subgraph Backend Services
        API -->|ORM| DB[(PostgreSQL)]
        API -->|Cache/Queue| Redis[(Redis)]
        API -->|Uploads| Cloudinary[Cloudinary]
        API -->|Payments| Razorpay[Razorpay]
    end
```

## 2. Frontend Architecture (`apps/web`)

Built with **Next.js 14**, utilizing the **App Router** for robust server-side rendering (SSR) and SEO benefits.

- **UI System**: Clean, component-based UI using **Tailwind CSS**. No heavy UI libraries; pure, accessible HTML/CSS components (`src/components/ui/*.tsx`).
- **State Management**: Server Components fetch data directly. Client interactions use React Hooks (`useState`, `useEffect`) and Context (`AuthContext`).
- **Performance**:
  - Image optimization via `next/image`.
  - Lazy loading for heavy sections (`ScrollReveal`).
- **Error Tracking**: Sentry integration for client-side error monitoring.

## 3. Backend Architecture (`apps/api`)

Built with **Node.js** and **Express**, structured in a layered architecture to ensure separation of concerns.

- **Controller Layer**: Handles HTTP requests, input validation (Zod), and response formatting.
- **Service Layer**: Contains purely business logic (e.g., `BookingService`, `UserService`). Decoupled from HTTP.
- **Data Access Layer**: **Prisma ORM** provides a type-safe interface to PostgreSQL.
- **Queue System**: **BullMQ** (Redis) handles background tasks like sending booking confirmation emails.

### Security
- **RBAC**: Dynamic Role-Based Access Control. Users have roles (`ADMIN`, `USER`), and roles have permissions. Middleware (`requirePermission`) enforces this at the route level.
- **Rate Limiting**: Global and route-specific limits (Auth, Payments) to prevent abuse.
- **Helmet**: Sets secure HTTP headers (CSP, HSTS).

## 4. Key Workflows

### Authentication & Authorization
1.  **Login**: User sends credentials. Server validates and issues:
    - `accessToken` (Short-lived, signed JWT).
    - `refreshToken` (Long-lived, stored securely in DB).
2.  **Access**: All protected routes require a valid `accessToken` in the `Authorization` header.
3.  **RBAC**:
    - `auth.middleware` decodes the token and attaches the user to `req`.
    - `permission.middleware` checks if the user's role has the required permission key (e.g., `TRIP_CREATE`).

### Booking Lifecycle
An event-driven flow ensuring data consistency.

1.  **Initiation**: User requests a booking (`REQUESTED`). Price is locked at this stage.
2.  **Payment**: User initiates payment via Razorpay.
    - Status: `Booking: REQUESTED`, `Payment: PENDING`.
3.  **Completion**:
    - **Success**: Webhook confirms payment -> `Payment: CAPTURED` -> `Booking: CONFIRMED`.
    - **Failure**: Webhook alerts failure -> `Payment: FAILED`.
4.  **Operational**:
    - Manage moves booking to `COMPLETED` after the trip ends.
    - User/Admin can `CANCEL` (subject to policy).

### Payment Lifecycle (Razorpay)
1.  **Order Creation**: Backend generates a Razorpay Order ID.
2.  **Client Checkout**: Frontend opens Razorpay modal with Key + Order ID.
3.  **Verification**:
    - **Synchronous**: Frontend sends signature to `/verify` endpoint immediately after success.
    - **Asynchronous**: Razorpay Webhooks (`order.paid`, `payment.failed`) hit the backend to handle edge cases (e.g., window closed before verification).

### Media Upload
1.  **Direct Upload**: (Currently) Media is uploaded to the backend via `multer`.
2.  **Cloud Storage**: Backend streams the file to **Cloudinary**.
3.  **Response**: Cloudinary returns the secure URL (`medium`, `thumb`), which is saved to the `Image` table in Postgres.

## 5. Why Monorepo?

- **Unified Context**: Full-stack visibility in one window makes refactoring across API and Web easier.
- **Shared Configuration**: ESLint, Prettier, and TypeScript configs are shared, ensuring code style consistency.
- **Atomic Commits**: A feature requiring both API and Web changes can be committed together, ensuring the repo is always in a buildable state.
