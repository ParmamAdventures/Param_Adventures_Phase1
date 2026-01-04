# Testing Strategy & Critical Scenarios

Based on the audit of `apps/api` and `apps/web`, the following tests are prioritized to ensure stability for Release 1.0.

## 1. Critical Backend Tests (API)

**Location**: `apps/api/tests/integration/critical_paths.test.ts`
**Tooling**: Jest + Supertest (Existing setup)

| Test Case | Scenario | WHY it matters |
| :--- | :--- | :--- |
| **B1. Concurrent Bookings** | Simulating 2 users booking the *last* slot simultaneously. | **Inventory**: Prevents overbooking. |
| **B2. Price Tampering** | User payload sends `totalPrice: 1` for a `1000` trip. | **Revenue**: Server must ignore client price. |
| **B3. RBAC Enforcement** | User tries to `DELETE /trips/:id`. | **Security**: Verifies `requirePermission` works. |
| **B4. Booking State Machine** | `CANCEL` a `COMPLETED` booking. | **Integrity**: Prevents refunding completed trips. |
| **B5. Unavailable Trip** | Booking a `DRAFT` trip. | **Logic**: Draft trips shouldn't be bookable. |

### Implementation Blueprint
```typescript
// apps/api/tests/integration/critical.test.ts
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma"; // Adjust import if needed

describe("Critical Backend Paths", () => {
  // Setup: Create Users (Admin, User) and Trip (Capacity: 1)
  
  // B1: Concurrent Bookings
  it("should prevent overbooking when capacity is 1", async () => {
    const trip = await prisma.trip.create({ /* capacity: 1 */ });
    
    // Fire two requests simultaneously
    const req1 = request(app).post("/bookings").set("Authorization", user1Token).send({ tripId: trip.id });
    const req2 = request(app).post("/bookings").set("Authorization", user2Token).send({ tripId: trip.id });
    
    const [res1, res2] = await Promise.all([req1, req2]);
    
    // Only one should succeed
    const successes = [res1.status, res2.status].filter(s => s === 201).length;
    expect(successes).toBe(1);
  });

  // B2: Price Tampering
  it("should ignore client-sent totalPrice", async () => {
    const res = await request(app)
      .post("/bookings")
      .send({ tripId, guests: 1, totalPrice: 1 }); // Malicious price
      
    // Server calculates actual price (e.g., 500)
    expect(res.body.data.totalPrice).toBe(500); 
  });
});
```

## 2. Frontend Smoke Tests (Web)

**Tooling**: Jest + React Testing Library (Existing setup)
Note: While E2E (Playwright) is better for flows, you requested Jest. We will test components/hooks.

| Test Case | Scenario | WHY it matters |
| :--- | :--- | :--- |
| **F1. Auth Context** | `useAuth` hook initializes from cookie. | **UX**: Verifies login persistence. |
| **F2. Booking Form** | Clicking "Book" calls the API with correct payload. | **Conversion**: Form doesn't send bad data. |
| **F3. Search Input** | Typing triggers API callback (debounced). | **Discovery**: Search actually sends queries. |

### Implementation Blueprint
```tsx
// apps/web/src/__tests__/BookingForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import BookingForm from "../components/bookings/BookingForm";

// F2: Booking Form Smoke Test
it("submits correct payload on click", () => {
  const mockSubmit = jest.fn();
  render(<BookingForm onSubmit={mockSubmit} price={100} />);
  
  fireEvent.change(screen.getByLabelText("Guests"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: /book/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({
    guests: 2,
    totalPrice: 200 // Verified client-side calc before sending
  });
});
```

## 3. Payment Critical Tests

**Location**: `apps/api/tests/integration/payments.test.ts`

| Test Case | Scenario | WHY it matters |
| :--- | :--- | :--- |
| **P1. Signature Verification** | Fake webhook signature. | **Security**: Spoof prevention. |
| **P2. Idempotency** | Duplicate `payment.captured` event. | **Reliability**: No double processing. |

### Implementation Blueprint
```typescript
// P1: Webhook Signature
it("should reject webhook with invalid signature", async () => {
  const res = await request(app)
    .post("/webhooks/razorpay")
    .set("x-razorpay-signature", "fake_signature")
    .send({ event: "payment.captured" });
    
  expect(res.status).toBe(400); // Bad Request / Forbidden
});
```
