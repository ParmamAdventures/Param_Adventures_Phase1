# System Architecture — Param Adventures

This document outlines the high-level architecture of the Param Adventures platform, focusing on system components, data flow, and design patterns.

---

## 🏗️ Monorepo Structure

Param Adventures uses an NPM Workspaces monorepo to manage frontend, backend, and testing packages with shared type safety and configuration.

- **`apps/web`**: Next.js 14 (App Router) frontend.
- **`apps/api`**: Express.js (TypeScript) backend.
- **`apps/e2e`**: Playwright end-to-end testing suite.
- **`packages/shared`**: (Planned) Shared TypeScript interfaces and utility functions.

---

## 🖥️ Backend Architecture (`apps/api`)

The backend follows a modular, service-oriented pattern designed for scalability and maintainability.

### 🔌 API Layer
- **Routes**: Domain-specific route files (e.g., `trips.routes.ts`, `auth.routes.ts`).
- **Middleware**: 
  - `auth.middleware.ts`: JWT verification and user hydration.
  - `permission.middleware.ts`: RBAC enforcement using granular permissions.
  - `error.middleware.ts`: Centralized error handling for all environments.
- **Controllers**: Thin controllers that validate input and orchestrate service calls. We use `catchAsync` to handle promises and `ApiResponse` for standardized JSON outputs.

### ⚙️ Service Layer
- **Business Logic**: Encapsulated in services (e.g., `AuthService`, `TripService`).
- **Data Access**: Prisma ORM (v4.16.2) for type-safe interaction with PostgreSQL.

### 📦 Infrastructure
- **Redis & BullMQ**: Handles asynchronous tasks like transactional emails and notification broadcasting.
- **Socket.io**: Provides real-time bi-directional communication for booking alerts and status updates.

---

## 🎨 Frontend Architecture (`apps/web`)

The frontend is built for performance and responsive UX using modern React patterns.

### 🧩 Components
- **UI Primitives**: Custom-built accessible components (Buttons, Inputs, Modals) using TailwindCSS.
- **Feature Components**: Domain-specific UI (e.g., `TripHero`, `ItineraryBuilder`).

### 🌊 Data Flow
- **API Client**: A standardized `apiFetch` wrapper that handles auth tokens, refresh logic, and error parsing.
- **State Management**: React Context for Auth and global UI state; Local state for form management and complex UI interactions (Itinerary).

---

## 🔐 Security Framework

- **Identity**: JWT-based authentication with `AccessToken` (short-lived) and `RefreshToken` (long-lived, HTTP-only cookie).
- **Authorization**: Roles (e.g., ADMIN, GUIDE) map to a set of granular Permissions (e.g., `trip:publish`).
- **Defenses**:
  - Helmet for security headers (HSTS, CSP).
  - Rate limiting on sensitive endpoints (Auth, Payments).
  - HMAC signature verification for payment webhooks.

---

## 📈 Real-time & Workers

- **Socket Rooms**: Users are automatically joined to private rooms (`user:{id}`) on connection to receive targeted alerts.
- **Worker Processes**: Decoupled workers process background jobs from the Redis queue with automatic retries and exponential backoff.
