# Security Documentation

Param Adventures prioritizes the security of user data and payments. This document outlines the security architecture and measures implemented in the platform.

## 1. Authentication & Authorization

### Authentication Method
- **Strategy**: JSON Web Tokens (JWT) using a dual-token system (Access + Refresh).
- **Access Tokens**: Short-lived (15 minutes), signed with `HS256`. Passed in `Authorization: Bearer <token>` header.
- **Refresh Tokens**: Long-lived (7 days), stored in **HttpOnly, Secure, SameSite=Lax/Strict** cookies. This mitigation strategy prevents XSS attacks from easily stealing credentials.

### Authorization (RBAC)
We employ a dynamic Role-Based Access Control system:
- **Middleware**: `requirePermission('PERMISSION_KEY')` verifies access at the route level.
- **Hierarchy**: Roles (`ADMIN`, `TRIP_MANAGER`, `USER`) are assigned permission sets. These logic checks happen in the Service layer (`src/middleware/permission.middleware.ts`), preventing unauthorized vertical or horizontal access.

## 2. Payment Security

All payment processing is offloaded to **Razorpay**, ensuring PCI-DSS compliance.

- **No Card Storage**: We do **not** store credit card numbers or banking secrets on our servers.
- **Order Integrity**: Order IDs are generated on the backend to lock the amount before the client sees the checkout.
- **Verification**:
  - **Signature Verification**: Validates `razorpay_signature` using HMAC-SHA256 to ensure the payment payload has not been tampered with.
  - **Reconciliation**: Backend status is the source of truth, updated via webhooks.

## 3. Webhook Security

Webhooks (e.g., Razorpay) are secured against spoofing and replay attacks.

- **Signature Validation**: The `razorpay-signature` header is validated against our `RAZORPAY_WEBHOOK_SECRET` before processing any event.
- **Idempotency**: Webhook events are designed to be idempotent; processing the same event ID twice will not result in duplicate bookings or refunds.

## 4. Environment Variables

- **Validation**: Strict schema validation using **Zod** (`src/config/env.ts`) ensures the application fails to start if critical keys (Database URL, Secrets) are missing.
- **Secret Management**:
  - `.env` files are `.gitignored`.
  - Secrets are injected at runtime in production environments (Render/Vercel).

## 5. Input Validation & Defense

- **Zod Schemas**: Every API endpoint uses Zod to validate request bodies, query params, and headers.
- **SQL Injection**: Prevented via **Prisma ORM**, which uses parameterized queries by default.
- **XSS/Headers**: **Helmet** middleware sets security headers (CSP, X-Frame-Options, HSTS).

## 6. Known Security Limitations

- **Rate Limiting**: While implemented, distributed rate limiting relies on a single Redis instance. A DDoS at scale could overwhelm the Redis connection.
- **Session Management**: JWTs are stateless. Revoking access (e.g., banning a user) is effective only after the short-lived Access Token expires (max 15 mins) or via a blacklist mechanism (partially implemented).
- **File Uploads**: Files are validated by MIME type, but deep content inspection (malware scanning) is currently offloaded to Cloudinary's basic checks.

## 7. Reporting Vulnerabilities

If you find a security issue, please contact us privately at **security@paramadventures.com**. Do not open public GitHub issues for sensitive vulnerabilities.
