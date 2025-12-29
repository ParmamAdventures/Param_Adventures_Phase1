# Test Plan — Param Adventures

Last updated: 2025-12-19

This document captures manual and automated test cases for the repository. Use it to run QA, track execution, and link to PRs.

## Summary

- Scope: UI feedback (toasts), payment flows, admin booking actions, skeleton loaders, motion primitives, and core UI primitives (Button, ErrorBlock, Input).
- Owners: Engineering / QA

## Environment

- Node: >=18
- OS: cross-platform (Windows / macOS / Linux)
- Browsers: Chrome, Firefox, Safari (desktop), Mobile Chrome
- Local API: set `NEXT_PUBLIC_API_URL` to local backend or use staging test API

## How to run

From repository root:

```bash
cd apps/web
npm install
npm test          # run unit tests
npm run build     # production build
npm run dev       # start dev server
```

## Test Case Template

- ID: (e.g., UI-TOAST-001)
- Title:
- Preconditions:
- Steps:
- Expected Result:
- Priority: (High/Med/Low)
- Status: (Not executed / Pass / Fail)
- Notes:

## Manual Tests (initial)

- ID: UI-TOAST-001
  - Title: Toast appears on payment initiation
  - Preconditions: User signed in, booking with pending payment exists
  - Steps: Go to My Bookings → Click `Pay Now` for a pending booking → Observe toast
  - Expected: Toast with message "Payment initiated" appears and auto-dismisses
  - Priority: High

- ID: UI-TOAST-002
  - Title: Toasts for admin approve/reject actions
  - Preconditions: Admin user signed in, booking in `REQUESTED` state
  - Steps: Go to Admin Trip Bookings → Click `Approve` or `Reject` → Observe toast at start, success or error
  - Expected: Toast shows "Approving booking…" then "Booking approved" (or error message)
  - Priority: High

- ID: UI-PAYMENT-001
  - Title: PayNow flow dev fallback simulation
  - Preconditions: Dev order (order id starts with `order_test_`)
  - Steps: Click `Pay Now` → Click `Simulate success (dev)` → Observe booking update
  - Expected: Booking `paymentStatus` updates to `PAID` and user sees success message
  - Priority: Medium

- ID: UI-PAYMENT-002
  - Title: Server-side Verification (Razorpay signature)
  - Preconditions: Real Razorpay order or Dev simulation trigger
  - Steps: Complete checkout or trigger dev simulation → API receives callback/webhook
  - Expected: Backend validates HMAC signature, updates booking to `CONFIRMED`
  - Priority: High

- ID: UI-SKELETON-001
  - Title: Trips skeleton shows during client-side fetch
  - Steps: Navigate to Trips page in dev mode with network slow throttling → Observe skeleton placeholders
  - Expected: Skeleton UI shown while data loads
  - Priority: Medium

- ID: ADMIN-ROLE-001
  - Title: Configure Role Permissions
  - Preconditions: Super Admin signed in
  - Steps: Go to Admin Roles → Click `Configure Access` on 'UPLOADER' → Toggle `blog:publish` → Save
  - Expected: Success toast appears, modal closes, and permission is persisted (verify via UI or API)
  - Priority: Medium

- ID: PROFILE-AVATAR-001
  - Title: Switch to Preset Avatar
  - Preconditions: User signed in
  - Steps: Go to Profile → Click `Choose Preset` → Select an icon → Save
  - Expected: Profile image updates immediately and persists on refresh.
  - Priority: Medium

- ID: ADMIN-TRIP-001
  - Title: Assign Manager to Trip
  - Preconditions: Admin signed in, trip exists
  - Steps: Go to Admin Trips → Edit Trip → Use Assignments panel → Select Manager → Save
  - Expected: Manager is assigned and UI reflects the change.
  - Priority: High

- ID: ADMIN-TRIP-002
  - Title: Assign multiple Guides to Trip
  - Preconditions: Admin signed in, users with GUIDE role exist
  - Steps: Go to Admin Trips → Edit Trip → Use Assignments panel → Add multiple Guides
  - Expected: Multiple guides are linked to the trip and displayed as a list.
  - Priority: High

- ID: GUIDE-TRIP-001
  - Title: Operational view for Guides
  - Preconditions: User with TRIP_GUIDE role signed in, assigned to a trip
  - Steps: Sign in as Guide → View internal trip list/details
  - Expected: Only assigned trips are visible (or highlighted), Guest list is accessible.
  - Priority: Medium

## Automated tests to maintain

- Unit tests: `src/components/ui` (Button, ErrorBlock, ToastProvider)
- Suggested: Add integration tests for PayNow with mocked API responses (Cypress or Playwright)

## Acceptance Criteria

- All high-priority manual tests pass on staging before release.
- Unit tests must pass in CI (`npm test`).

## Notes

- Use `docs/TEST_PLAN.md` as the single source of truth. For per-app notes, add `apps/web/TEST_PLAN.md`.
