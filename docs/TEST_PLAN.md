# Test Plan — Param Adventures

This document outlines the testing strategy, environments, and automated workflows for Param Adventures.

---

## 🧪 Testing Layers

### 1. Unit & Integration Testing (Jest)
- **Scope**: Backend services, utilities, and controller logic.
- **Location**: `apps/api/tests/unit`
- **Commands**:
  ```bash
  cd apps/api
  npm test
  ```
- **Standards**: All new services must have corresponding `.test.ts` files with at least 80% branch coverage.

### 2. End-to-End Testing (Playwright)
- **Scope**: Critical user flows (Auth, Booking, Expeditions).
- **Location**: `apps/e2e/tests`
- **Commands**:
  ```bash
  cd apps/e2e
  npx playwright test
  ```
- **Requirements**: Clear the test database state before major runs using the global setup hooks.

---

## 🏗️ Environments

- **Local**: Full stack running via `npm run dev`.
- **CI**: GitHub Actions (planned) running linting and unit tests on every PR.
- **Staging**: Production-mirror environment for final E2E verification.

---

## 📋 Manual Test Scenarios

While we strive for 100% automation, the following scenarios require periodic manual verification:

| ID | Title | Priority | Flow |
| :--- | :--- | :--- | :--- |
| **PAY-01** | Razorpay Modal Interaction | High | Checkout -> Modal Opens -> SMS Verification |
| **OPS-01** | Guide Mobile View | Medium | Sign in as Guide -> Access Guest List on Phone |
| **SOC-01** | Real-time Toast Notifications | High | Admin approves booking -> User sees toast instantly |

---

## ✅ Acceptance Criteria

1. **Linting**: No errors in `apps/api` or `apps/web`.
2. **Unit Tests**: 100% pass rate in the API suite.
3. **E2E**: Critical paths (Signup -> Book -> Pay) must be green on Chrome/Firefox.
4. **Security**: All API responses must include security headers (HSTS, CSP).
