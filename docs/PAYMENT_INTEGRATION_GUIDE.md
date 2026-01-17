# Payment Integration Guide - Param Adventures

Complete guide for integrating and managing payments using Razorpay.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [Payment Flow](#payment-flow)
5. [API Endpoints](#api-endpoints)
6. [Webhook Integration](#webhook-integration)
7. [Testing](#testing)
8. [Error Handling](#error-handling)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Param Adventures uses **Razorpay** for payment processing with the following features:

✅ **Core Features**:

- Payment initiation and verification
- Full and partial refunds
- Payment status tracking
- Webhook event handling
- Invoice generation (PDF)
- Email notifications
- Payment reconciliation with automatic retry
- Dispute management

**Supported Payment Methods**: UPI, Cards, Net Banking, Wallets

---

## 🏗️ Architecture

```
┌──────────────┐
│   Frontend   │ (User initiates payment)
└──────┬───────┘
       │ POST /bookings/:id/initiate-payment
       ▼
┌──────────────────┐
│   API Server     │ ← Creates Razorpay Order
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Razorpay UI    │ ← User completes payment
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Frontend       │ ← Receives payment response
└──────┬───────────┘
       │ POST /bookings/:id/verify-payment
       ▼
┌──────────────────┐
│   API Server     │ ← Verifies signature & updates DB
│                  │ ← Sends confirmation email
└──────────────────┘
       │
       │ (Async webhook for redundancy)
       ▼
┌──────────────────┐
│   Razorpay       │ → POST /webhooks/razorpay
│   Webhook        │
└──────────────────┘
```

---

## ⚙️ Setup & Configuration

### 1. Razorpay Account Setup

1. **Create Account**: [razorpay.com/signup](https://razorpay.com/signup)
2. **Get API Keys**:
   - Go to Dashboard → Settings → API Keys
   - Generate Test Keys for development
   - Generate Live Keys for production
3. **Configure Webhooks**:
   - Dashboard → Webhooks → Add New Webhook
   - URL: `https://yourdomain.com/webhooks/razorpay`
   - Secret: Generate and save securely
   - Events: Select all payment and refund events

### 2. Environment Variables

Add to `.env`:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Payment Settings
PAYMENT_CURRENCY=INR
PAYMENT_RECEIPT_PREFIX=PARAM_ADV_
```

### 3. Initialize Razorpay SDK

The SDK is initialized in `apps/api/src/lib/razorpay.ts`:

```typescript
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

---

## 💳 Payment Flow

### Standard Payment Journey

```
1. User selects trip and creates booking (status: PENDING)
   ↓
2. User clicks "Pay Now"
   ↓
3. Frontend calls POST /bookings/:id/initiate-payment
   ↓
4. Backend creates Razorpay order, saves Payment record (status: PENDING)
   ↓
5. Frontend receives order details, opens Razorpay checkout
   ↓
6. User completes payment on Razorpay UI
   ↓
7. Razorpay returns payment response to frontend
   ↓
8. Frontend calls POST /bookings/:id/verify-payment
   ↓
9. Backend verifies signature, updates Payment (CAPTURED) & Booking (CONFIRMED)
   ↓
10. Email confirmation sent to user
    ↓
11. Razorpay webhook arrives (redundancy check)
```

### Development Mode (Simulation)

For testing without actual payment:

```typescript
// In verify-payment request
{
  "razorpay_payment_id": "DEV_SIMULATION",
  "razorpay_order_id": "<order_id>",
  "razorpay_signature": "DEV_SIMULATION"
}
```

---

## 🔌 API Endpoints

### 1. Initiate Payment

**Endpoint**: `POST /bookings/:id/initiate-payment`

**Auth**: Required (Bearer token)

**Request**:

```http
POST /bookings/abc-123/initiate-payment
Authorization: Bearer <access_token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "orderId": "order_MkT8zX9Yh4Kqwe",
    "amount": 1500000,
    "currency": "INR",
    "booking": {
      "id": "abc-123",
      "tripTitle": "Himalayan Trek",
      "startDate": "2026-03-15"
    },
    "key": "rzp_test_xxxxx"
  }
}
```

**Errors**:

- `404`: Booking not found
- `403`: Not your booking
- `400`: Booking not in PENDING state
- `500`: Razorpay order creation failed

---

### 2. Verify Payment

**Endpoint**: `POST /bookings/:id/verify-payment`

**Auth**: Required (Bearer token)

**Request**:

```json
{
  "razorpay_payment_id": "pay_MkT9abc123",
  "razorpay_order_id": "order_MkT8zX9Yh4Kqwe",
  "razorpay_signature": "a1b2c3d4e5f6..."
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "abc-123",
      "status": "CONFIRMED"
    },
    "payment": {
      "id": "payment-xyz",
      "status": "CAPTURED",
      "amount": 15000,
      "currency": "INR"
    }
  },
  "message": "Payment verified successfully"
}
```

**Errors**:

- `400`: Invalid signature
- `404`: Booking or payment not found
- `500`: Database update failed

**Signature Verification**:

```typescript
const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
hmac.update(order_id + "|" + payment_id);
const generatedSignature = hmac.digest("hex");

if (generatedSignature !== razorpay_signature) {
  throw new Error("Invalid signature");
}
```

---

### 3. Get Payment Status

**Endpoint**: `GET /bookings/:id/payment-status`

**Auth**: Required (Bearer token, must be booking owner or admin)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "bookingId": "abc-123",
    "status": "CAPTURED",
    "amount": 15000,
    "currency": "INR",
    "method": "upi",
    "createdAt": "2026-01-17T10:30:00Z",
    "capturedAt": "2026-01-17T10:32:00Z"
  }
}
```

---

### 4. Get Payment History

**Endpoint**: `GET /bookings/payments/history`

**Auth**: Required (Bearer token)

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 10)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-xyz",
        "bookingId": "abc-123",
        "amount": 15000,
        "status": "CAPTURED",
        "createdAt": "2026-01-17T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

---

### 5. Process Refund (Admin Only)

**Endpoint**: `POST /bookings/:id/refund`

**Auth**: Required (Bearer token + super_admin role)

**Request**:

```json
{
  "amount": 7500,
  "reason": "User requested cancellation"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "refund": {
      "id": "rfnd_MkUabc123",
      "amount": 7500,
      "status": "REFUNDED"
    },
    "payment": {
      "status": "PARTIALLY_REFUNDED",
      "refundedAmount": 7500
    }
  },
  "message": "Refund processed successfully"
}
```

**Refund Types**:

- **Full Refund**: `amount` = original payment amount
- **Partial Refund**: `amount` < original payment amount

---

### 6. Admin Refund History

**Endpoint**: `GET /admin/refunds`

**Auth**: Required (Bearer token + admin role)

**Query Parameters**:

- `page`, `limit` (pagination)
- `minAmount`, `maxAmount` (amount range)
- `startDate`, `endDate` (date range)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "refunds": [
      {
        "id": "rfnd_123",
        "bookingId": "abc-123",
        "userId": "user-456",
        "userName": "John Doe",
        "tripTitle": "Himalayan Trek",
        "amount": 7500,
        "status": "REFUNDED",
        "processedAt": "2026-01-17T12:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 7. Generate Invoice

**Endpoint**: `GET /bookings/:id/invoice`

**Auth**: Required (Bearer token, booking owner or admin)

**Response**: PDF file stream

**Headers**:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice-PARAM_ADV_abc123.pdf"
```

**Invoice Contents**:

- Company header with logo
- Invoice number and date
- Customer details
- Booking and trip information
- Payment details
- Itemized breakdown
- GST calculation (18%)
- Total amount

---

## 🔔 Webhook Integration

### Webhook Endpoint

**URL**: `POST /webhooks/razorpay`

**Purpose**: Receive real-time payment events from Razorpay for redundancy and automation.

### Supported Events

| Event                     | Description                     | Action                                       |
| ------------------------- | ------------------------------- | -------------------------------------------- |
| `payment.captured`        | Payment successful              | Update Payment: CAPTURED, Booking: CONFIRMED |
| `payment.failed`          | Payment failed                  | Update Payment: FAILED, notify user          |
| `payment.dispute.created` | Dispute raised                  | Store dispute ID, alert admin                |
| `payment.dispute.won`     | Dispute resolved (merchant won) | Update Payment: CAPTURED                     |
| `payment.dispute.lost`    | Dispute resolved (customer won) | Update Payment: REFUNDED                     |
| `refund.processed`        | Refund completed                | Update Payment: REFUNDED, Booking: CANCELLED |

### Webhook Signature Verification

```typescript
const webhookSignature = req.headers["x-razorpay-signature"];
const webhookBody = JSON.stringify(req.body);

const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
  .update(webhookBody)
  .digest("hex");

if (webhookSignature !== expectedSignature) {
  throw new Error("Invalid webhook signature");
}
```

### Handling Webhook Events

**Example Flow** (payment.captured):

```typescript
const { event, payload } = req.body;

if (event === "payment.captured") {
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: payload.payment.entity.id },
  });

  // Update payment and booking
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        method: payload.payment.entity.method,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  // Queue confirmation email
  await paymentQueue.add("SEND_PAYMENT_EMAIL", {
    userId: booking.userId,
    bookingId: booking.id,
  });
}
```

### Replay Attack Prevention

```typescript
// Check if webhook already processed
const webhookId = req.headers["x-razorpay-event-id"];
const exists = await redis.get(`webhook:${webhookId}`);

if (exists) {
  return res.status(200).json({ received: true }); // Idempotent
}

// Process webhook...

// Mark as processed (TTL: 24 hours)
await redis.set(`webhook:${webhookId}`, "1", "EX", 86400);
```

---

## 🧪 Testing

### 1. Test Cards (Razorpay Test Mode)

| Card Number         | Expiry     | CVV | Result                  |
| ------------------- | ---------- | --- | ----------------------- |
| 4111 1111 1111 1111 | Any future | Any | Success                 |
| 4000 0000 0000 0002 | Any future | Any | Card declined           |
| 4000 0025 0000 3155 | Any future | Any | Authentication required |

### 2. Development Simulation

Bypass Razorpay for local testing:

```typescript
// In verify-payment controller
if (
  process.env.NODE_ENV === "development" &&
  razorpay_payment_id === "DEV_SIMULATION"
) {
  // Skip signature verification, mark as captured
}
```

### 3. Testing Webhooks Locally

**Option 1**: Use ngrok

```bash
ngrok http 3001
# Update Razorpay webhook URL: https://abc123.ngrok.io/webhooks/razorpay
```

**Option 2**: Manual webhook trigger

```bash
curl -X POST http://localhost:3001/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: <test_signature>" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test456",
          "status": "captured",
          "amount": 1500000,
          "method": "upi"
        }
      }
    }
  }'
```

### 4. Integration Tests

Run payment integration tests:

```bash
cd apps/api
npm test -- payments.test.ts
```

**Test Coverage**:

- ✅ Payment initiation (14 tests)
- ✅ Signature verification
- ✅ Dev simulation mode
- ✅ Refund processing (full/partial)
- ✅ Webhook handling (all events)
- ✅ Payment status retrieval
- ✅ Admin refund history

---

## 🚨 Error Handling

### Common Error Codes

| Code                 | HTTP Status | Description            | Resolution                   |
| -------------------- | ----------- | ---------------------- | ---------------------------- |
| `BOOKING_NOT_FOUND`  | 404         | Booking doesn't exist  | Check booking ID             |
| `PAYMENT_NOT_FOUND`  | 404         | Payment record missing | Check payment ID             |
| `UNAUTHORIZED`       | 403         | Not booking owner      | Login as correct user        |
| `INVALID_SIGNATURE`  | 400         | Signature mismatch     | Check API keys, retry        |
| `INVALID_STATE`      | 400         | Booking not PENDING    | Booking already processed    |
| `RAZORPAY_ERROR`     | 500         | Razorpay API failure   | Check Razorpay status, retry |
| `INSUFFICIENT_FUNDS` | 400         | Refund amount > paid   | Adjust refund amount         |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Payment signature verification failed",
    "details": {
      "orderId": "order_MkT8zX9Yh4Kqwe",
      "paymentId": "pay_MkT9abc123"
    }
  }
}
```

### Automatic Reconciliation

If signature verification fails, the system queues a reconciliation job:

```typescript
// Fetch actual status from Razorpay
const razorpayPayment = await razorpay.payments.fetch(paymentId);

// Update database to match Razorpay state
await prisma.payment.update({
  where: { providerPaymentId: paymentId },
  data: { status: razorpayPayment.status },
});
```

**Retry Strategy**: 3 attempts with exponential backoff (5s, 10s, 20s)

---

## 🔒 Security

### Best Practices

1. **Never Expose Secrets**:
   - Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` in environment variables
   - Don't commit secrets to Git
   - Rotate keys periodically

2. **Always Verify Signatures**:
   - Payment verification: Check `razorpay_signature`
   - Webhooks: Verify `x-razorpay-signature` header

3. **Use HTTPS**:
   - All production endpoints must use HTTPS
   - Razorpay webhooks require HTTPS

4. **Validate Amount**:
   - Check booking amount matches Razorpay order amount
   - Prevent amount tampering

5. **Idempotency**:
   - Handle duplicate webhooks gracefully
   - Use Redis to track processed webhook IDs

6. **Authorization**:
   - Users can only pay for their own bookings
   - Only admins can process refunds
   - Verify booking ownership in every endpoint

### PCI Compliance

✅ **No Card Data Storage**: Razorpay handles all sensitive card data
✅ **Tokenization**: No raw card numbers in our database
✅ **Secure Communication**: All API calls use HTTPS
✅ **Audit Logging**: All payment actions logged in `AuditLog`

---

## 🔧 Troubleshooting

### Payment Fails After User Pays

**Symptoms**: User completes payment on Razorpay but booking status stays PENDING

**Causes**:

1. Signature verification failed
2. Network timeout
3. Database error

**Solutions**:

1. Check `Payment` record status in database
2. Look for reconciliation jobs in queue logs
3. Manually verify payment on Razorpay dashboard
4. If captured on Razorpay, manually update database:
   ```sql
   UPDATE "Payment" SET status = 'CAPTURED' WHERE "providerPaymentId" = 'pay_xyz';
   UPDATE "Booking" SET status = 'CONFIRMED' WHERE id = 'booking_id';
   ```

---

### Webhook Not Received

**Symptoms**: Payment successful but webhook never arrives

**Causes**:

1. Webhook URL not configured in Razorpay
2. Server not accessible (firewall/ngrok expired)
3. Webhook secret mismatch

**Solutions**:

1. Check Razorpay Dashboard → Webhooks → Event Logs
2. Verify webhook URL is correct and accessible
3. Check server logs for incoming webhook requests
4. Manually replay webhook from Razorpay dashboard

---

### Refund Fails

**Symptoms**: Refund request returns error

**Causes**:

1. Payment not captured yet
2. Refund amount exceeds available amount
3. Razorpay API timeout

**Solutions**:

1. Check payment status in database (must be CAPTURED)
2. Calculate available refund: `amount - refundedAmount`
3. Retry after a few minutes if Razorpay timeout
4. Check Razorpay dashboard for refund status

---

### Development Simulation Not Working

**Symptoms**: DEV_SIMULATION mode rejected

**Causes**:

1. `NODE_ENV` not set to `development`
2. Wrong payment ID format

**Solutions**:

1. Ensure `.env` has `NODE_ENV=development`
2. Use exact string `DEV_SIMULATION` for payment ID and signature
3. Restart server after env changes

---

## 📊 Analytics & Reporting

Payment analytics available at:

**Admin Dashboard** (`GET /admin/analytics/payments`):

- Total revenue
- Success rate
- Failed payment reasons
- Payment method breakdown
- Refund statistics

**Revenue Report** (`GET /admin/analytics/revenue`):

- Monthly revenue chart (last 6 months)
- Growth percentage
- Potential revenue (pending bookings)

---

## 📞 Support

**Razorpay Support**:

- Email: support@razorpay.com
- Dashboard: [razorpay.com/support](https://razorpay.com/support)
- Status Page: [status.razorpay.com](https://status.razorpay.com)

**Internal Support**:

- Check server logs: `apps/api/logs/`
- Review audit logs: Database `AuditLog` table
- Monitor queue: Redis queue dashboard

---

## 📚 Additional Resources

- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Razorpay Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Testing Guide](./TESTING_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
