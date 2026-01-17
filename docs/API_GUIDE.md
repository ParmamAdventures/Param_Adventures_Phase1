# API Guide — Param Adventures

This guide establishes the standards and patterns for developing and consuming the Param Adventures API.

---

## 🛰️ Base URLs

- **Development**: `http://localhost:3001`
- **Swagger UI**: `/api-docs`

---

## 🛠️ Standards & Patterns

### 1. Response Structure

All API responses should follow the `ApiResponse` utility pattern to ensure consistency across the platform.

**Success (200/201)**

```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created successfully"
}
```

**Error (4xx/5xx)**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [...]
  }
}
```

### 2. Controller Pattern

Use the `catchAsync` wrapper to eliminate repetitive `try-catch` blocks.

```typescript
export const createTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await TripService.create(req.body);
  res.status(201).json(ApiResponse.success(trip, "Trip created"));
});
```

### 3. Authentication Headers

Except for public routes (`/trips/public`, `/auth/login`), all requests must include the Bearer token:

```http
Authorization: Bearer <access_token>
```

---

## 🔐 Auth & Cookies

- **Access Token**: Short-lived (15m), passed via `Authorization` header.
- **Refresh Token**: Long-lived (7d), stored in a **Secure, HTTP-only** cookie.
- **Refresh Flow**: The frontend automatically calls `/auth/refresh` when the access token expires.

---

## 🌊 Webhooks

The system supports webhooks for external providers.

- **Payments**: `/webhooks/razorpay` (Production webhook endpoint with signature verification)
- **Validation**: Every webhook must be verified via HMAC signature or source IP check.

---

## 💳 Payment Endpoints

### Overview

Complete payment processing system using Razorpay. See [PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md) for detailed integration guide.

### Endpoints

#### 1. Initiate Payment

```http
POST /bookings/:id/initiate-payment
Authorization: Bearer <access_token>
```

**Purpose**: Creates Razorpay order and returns details for frontend checkout.

**Response**:

```json
{
  "success": true,
  "data": {
    "orderId": "order_MkT8zX9Yh4Kqwe",
    "amount": 1500000,
    "currency": "INR",
    "key": "rzp_test_xxxxx"
  }
}
```

#### 2. Verify Payment

```http
POST /bookings/:id/verify-payment
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**Purpose**: Verifies payment signature and updates booking status to CONFIRMED.

**Security**: HMAC-SHA256 signature verification required.

#### 3. Get Payment Status

```http
GET /bookings/:id/payment-status
Authorization: Bearer <access_token>
```

**Purpose**: Retrieve current payment status for a booking.

**Access**: Booking owner or admin only.

#### 4. Payment History

```http
GET /bookings/payments/history?page=1&limit=10
Authorization: Bearer <access_token>
```

**Purpose**: Paginated payment history for logged-in user.

#### 5. Process Refund (Admin)

```http
POST /bookings/:id/refund
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 7500,
  "reason": "User cancellation"
}
```

**Purpose**: Process full or partial refund.

**Access**: Super admin only.

**Features**:

- Full refunds: `amount` = original payment
- Partial refunds: `amount` < original payment
- Cumulative refund tracking

#### 6. Admin Refund History

```http
GET /admin/refunds?page=1&limit=10&minAmount=1000&maxAmount=50000
Authorization: Bearer <access_token>
```

**Purpose**: View all refunds with filtering and pagination.

**Access**: Admin role required.

**Filters**: amount range, date range, status.

#### 7. Generate Invoice

```http
GET /bookings/:id/invoice
Authorization: Bearer <access_token>
```

**Purpose**: Download PDF invoice for completed booking.

**Response**: PDF file stream with invoice details.

#### 8. Razorpay Webhook (System)

```http
POST /webhooks/razorpay
Content-Type: application/json
x-razorpay-signature: <webhook_signature>
```

**Purpose**: Receive payment events from Razorpay for redundancy.

**Events Handled**:

- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `payment.dispute.created/won/lost`: Dispute management
- `refund.processed`: Refund completed

**Security**: Webhook signature verification required.

---

## 🧪 Documentation (OpenAPI)

We use Swagger for interactive API documentation.

- **Annotations**: Use JSDoc comments in route files to describe parameters and responses.
- **Updates**: Update annotations immediately when changing route logic.
