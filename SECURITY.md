# Security Policy

## Security Measures Taken

### 1. Authentication & Authorization

- **JWT (JSON Web Tokens)**: Used for stateless authentication. Access tokens are short-lived.
- **Token Revocation (Denylist)**: A Redis-backed denylist is implemented to support immediate token invalidation on logout or security events, addressing statelessness vulnerabilities.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions are enforced via middleware (`requirePermission`).

### 2. Input Validation & Sanitization

- **Zod**: All API endpoints have strict input validation schemas. Invalid requests are rejected with a `400 Bad Request` before reaching business logic.
- **Parameterized Queries**: Prisma ORM is used to prevent SQL injection by automatically parameterizing all queries.

### 3. API Security

- **Helmet**: Secured HTTP headers to protect against common web vulnerabilities (XSS, Clickjacking, etc.).
- **Rate Limiting**: Implemented for all routes, with stricter limits on auth and payment endpoints to prevent Brute Force and DoS attacks.
- **CORS**: Configured with a strict whitelist of allowed origins.

### 4. Infrastructure & Configuration

- **Environment Variables**: Secrets are never hardcoded and are managed via `.env` files and validated at runtime using Zod.
- **Sentry Error Tracking**: Used to monitor and alert on security-related errors without exposing sensitive data in logs.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it via [security@paramadventures.com](mailto:security@paramadventures.com).
