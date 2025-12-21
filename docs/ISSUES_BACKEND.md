# Backend: Missing Endpoints / Gaps (Quick Scan)

Date: 2025-12-19

This file lists backend endpoints and features the frontend expects or that are desirable but appear missing or incomplete in the current repository.

Summary
-------
- A quick scan shows core API routes present: `/auth/*`, `/trips/*`, `/bookings/*`, `/payments/*`, `/admin/*` (roles/users), `/webhooks`, `/metrics` and a `/health` endpoint.
- The frontend's `apiFetch` calls map to these implemented routes. No immediate 1:1 missing route was detected for the API calls present in the frontend.

However, several backend features/endpoints are missing or incomplete and should be tracked as issues/PRs:

1. Audit Logging API & Immutable Store
   - Purpose: record role changes, approvals, deletes, status transitions with before/after payloads.
   - Suggested: `POST /audit` (internal writes via server utilities) + `GET /admin/audit` (readonly viewer for admins).
   - Current status: no dedicated audit controller or read API found. Prisma schema includes `audit_logs` migration but audit utilities are not fully implemented.

2. Media Upload / Cloudinary Integration
   - Purpose: handle signed uploads, transformations, and ownership rules.
   - Suggested endpoints: `POST /media/sign` (returns upload signature), `GET /media/:id` (metadata), `DELETE /media/:id` (owner-only).
   - Current status: no media routes/controllers found.

3. Admin Analytics / Metrics API
   - Purpose: provide dashboards for admin (user counts, booking metrics, revenue, conversion funnels).
   - Suggested endpoints: `GET /metrics/overview`, `GET /metrics/bookings`, etc.
   - Current status: `metrics.routes.ts` exists but surface area and controllers need review to confirm coverage.

4. Background Jobs & Notifications
   - Purpose: emails, payment reconciliations, media processing, audit archiving.
   - Suggested: a `/jobs` or worker process integration (BullMQ/Redis) and webhook handlers for retry logic.
   - Current status: no worker implementation; webhooks route exists for incoming provider events.

5. Security & Hardening Endpoints
   - Rate limiters (per-IP / per-user) and endpoints to check migration safety / health checks.
   - Health exists but consider readiness probe `/ready` and migration safety checks.

6. Admin Audit Viewer UI Backend Support
   - Purpose: frontend admin page to read audit logs with pagination and filters.
   - Suggested: `GET /admin/audit?limit=&cursor=&action=&actor=`.

Next steps (recommended)
------------------------
1. Create tracked GitHub Issues for the items above (Audit logging, Media, Metrics, Jobs, Security). 
2. Prioritize: Audit logging & Media integration (Phase 4 & 10) as high.
3. If you want, I can open PR stubs implementing:
   - a lightweight Audit middleware that writes to `audit_log` table on sensitive actions
   - a media signing endpoint that returns Cloudinary upload signature

I can now:
- Create local issue files (this file) and push (done).
- Open GH Issues/PRs if you give permission (or I can create PR branches with stubs for audit/media).
