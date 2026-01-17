# API Error Codes Reference

Complete catalog of API error codes and their meanings.

---

## 📋 Error Code Convention

**Format**: `XXX-YYY` where:

- `XXX` = HTTP Status Code (3 digits)
- `YYY` = Error identifier (3 digits)

**Example**: `400-001` = Bad Request (400), Validation Error (001)

---

## 🔴 4xx Client Errors

### 400 - Bad Request (Validation/Input Errors)

| Code    | Name                 | Message                                 | Cause                                     | Fix                                         |
| ------- | -------------------- | --------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| 400-001 | VALIDATION_ERROR     | "Validation failed"                     | Missing/invalid required fields           | Check request body matches schema           |
| 400-002 | INVALID_EMAIL        | "Invalid email format"                  | Email doesn't match RFC 5322              | Use valid email format                      |
| 400-003 | INVALID_PASSWORD     | "Password too weak"                     | Password < 8 chars or no uppercase/number | Use stronger password                       |
| 400-004 | INVALID_PHONE        | "Invalid phone number"                  | Phone format incorrect                    | Use valid phone format (10 digits)          |
| 400-005 | DUPLICATE_EMAIL      | "Email already exists"                  | Email used for another account            | Use different email                         |
| 400-006 | INVALID_AMOUNT       | "Invalid amount"                        | Amount ≤ 0 or not a number                | Use positive integer in paise               |
| 400-007 | INVALID_STATUS       | "Invalid status value"                  | Status not in enum                        | Use valid status (PENDING, CONFIRMED, etc.) |
| 400-008 | INVALID_DIFFICULTY   | "Invalid difficulty level"              | Difficulty not in enum                    | Use: EASY, MODERATE, DIFFICULT, EXTREME     |
| 400-009 | INVALID_DATE_RANGE   | "Check-out date must be after check-in" | Dates in wrong order                      | Ensure checkOut > checkIn                   |
| 400-010 | INVALID_PERSON_COUNT | "Must book at least 1 person"           | numPeople < 1                             | Enter numPeople ≥ 1                         |
| 400-011 | INVALID_RATING       | "Rating must be 1-5 stars"              | Rating outside 1-5 range                  | Use integer 1-5                             |
| 400-012 | INSUFFICIENT_SPOTS   | "Not enough available spots"            | numPeople > availableSpots                | Reduce number of people                     |
| 400-013 | INVALID_SIGNATURE    | "Invalid payment signature"             | Razorpay HMAC verification failed         | Ensure webhook secret matches               |
| 400-014 | MISSING_FIELD        | "Required field missing: {field}"       | Required field not provided               | Include {field} in request                  |
| 400-015 | INVALID_JSON         | "Invalid JSON in request body"          | Malformed JSON                            | Check JSON syntax                           |

### 401 - Unauthorized (Authentication Errors)

| Code    | Name                  | Message                            | Cause                           | Fix                                       |
| ------- | --------------------- | ---------------------------------- | ------------------------------- | ----------------------------------------- |
| 401-001 | NO_TOKEN              | "No authentication token provided" | Missing Authorization header    | Include `Authorization: Bearer <token>`   |
| 401-002 | INVALID_TOKEN         | "Invalid or expired token"         | Token invalid/expired/malformed | Login again to get new token              |
| 401-003 | TOKEN_EXPIRED         | "Token has expired"                | Token `exp` claim in past       | Use refresh token to get new access token |
| 401-004 | INVALID_CREDENTIALS   | "Invalid email or password"        | Email/password mismatch         | Check credentials and try again           |
| 401-005 | ACCOUNT_SUSPENDED     | "Account suspended"                | User status = SUSPENDED         | Contact support                           |
| 401-006 | EMAIL_NOT_VERIFIED    | "Email not verified"               | emailVerified = false           | Check email for verification link         |
| 401-007 | REFRESH_TOKEN_EXPIRED | "Refresh token expired"            | Refresh token expired           | Login again                               |
| 401-008 | INVALID_REFRESH_TOKEN | "Invalid refresh token"            | Refresh token invalid/malformed | Login again                               |

### 403 - Forbidden (Authorization Errors)

| Code    | Name               | Message                                     | Cause                       | Fix                          |
| ------- | ------------------ | ------------------------------------------- | --------------------------- | ---------------------------- |
| 403-001 | PERMISSION_DENIED  | "You don't have permission to {action}"     | Missing required permission | Request access or ask admin  |
| 403-002 | ADMIN_ONLY         | "This action requires admin role"           | User is not admin           | Login as admin or ask admin  |
| 403-003 | GUIDE_ONLY         | "This action requires guide role"           | User is not guide           | Ask admin for guide role     |
| 403-004 | MODERATOR_ONLY     | "This action requires moderator role"       | User is not moderator       | Ask admin for moderator role |
| 403-005 | NOT_OWNER          | "You can only {action} your own {resource}" | User doesn't own resource   | Use own resource ID          |
| 403-006 | NOT_BOOKING_OWNER  | "Only booking owner can {action}"           | User didn't make booking    | Use your booking ID          |
| 403-007 | CANNOT_REFUND_PAID | "Cannot refund already refunded payment"    | Payment already refunded    | Check payment status         |
| 403-008 | TRIP_NOT_YOURS     | "This trip is not assigned to you"          | Guide not assigned to trip  | Ask admin to assign trip     |

### 404 - Not Found

| Code    | Name                   | Message                     | Cause                      | Fix                              |
| ------- | ---------------------- | --------------------------- | -------------------------- | -------------------------------- |
| 404-001 | USER_NOT_FOUND         | "User not found"            | User ID doesn't exist      | Check user ID or email           |
| 404-002 | TRIP_NOT_FOUND         | "Trip not found"            | Trip ID/slug doesn't exist | Check trip ID                    |
| 404-003 | BOOKING_NOT_FOUND      | "Booking not found"         | Booking ID doesn't exist   | Check booking ID                 |
| 404-004 | PAYMENT_NOT_FOUND      | "Payment not found"         | Payment ID doesn't exist   | Check payment ID                 |
| 404-005 | REVIEW_NOT_FOUND       | "Review not found"          | Review ID doesn't exist    | Check review ID                  |
| 404-006 | BLOG_NOT_FOUND         | "Blog post not found"       | Blog ID/slug doesn't exist | Check blog ID                    |
| 404-007 | MEDIA_NOT_FOUND        | "Media file not found"      | Media ID doesn't exist     | Check media ID                   |
| 404-008 | ROLE_NOT_FOUND         | "Role not found"            | Role ID doesn't exist      | Use valid role ID                |
| 404-009 | NOTIFICATION_NOT_FOUND | "Notification not found"    | Notification doesn't exist | Check notification ID            |
| 404-010 | RESOURCE_DELETED       | "Resource has been deleted" | Resource soft-deleted      | Cannot restore deleted resources |

### 409 - Conflict

| Code    | Name                      | Message                                  | Cause                          | Fix                                     |
| ------- | ------------------------- | ---------------------------------------- | ------------------------------ | --------------------------------------- |
| 409-001 | DUPLICATE_BOOKING         | "Booking already exists for this trip"   | User already booked this trip  | Use different trip or cancel existing   |
| 409-002 | DUPLICATE_REVIEW          | "Review already exists for this booking" | One review per booking allowed | Edit existing review or delete it first |
| 409-003 | DUPLICATE_SAVED_TRIP      | "Trip already in saved list"             | User already saved this trip   | Remove from saved list first            |
| 409-004 | BOOKING_ALREADY_PAID      | "Booking already paid"                   | Booking status = PAID          | Cannot modify paid booking              |
| 409-005 | BOOKING_ALREADY_CANCELLED | "Booking already cancelled"              | Booking status = CANCELLED     | Cannot modify cancelled booking         |
| 409-006 | BOOKING_ALREADY_COMPLETED | "Booking already completed"              | Booking status = COMPLETED     | Cannot modify completed booking         |
| 409-007 | PAYMENT_ALREADY_CAPTURED  | "Payment already captured"               | Payment status = CAPTURED      | Cannot re-capture payment               |
| 409-008 | TRIP_NOT_PUBLISHED        | "Trip must be published"                 | Trip status ≠ PUBLISHED        | Publish trip first                      |
| 409-009 | SLUG_ALREADY_EXISTS       | "Slug already taken"                     | Slug used for another resource | Use unique slug                         |

---

## 🔥 5xx Server Errors

### 500 - Internal Server Error

| Code    | Name                   | Message                             | Cause                             | Fix                                |
| ------- | ---------------------- | ----------------------------------- | --------------------------------- | ---------------------------------- |
| 500-001 | DATABASE_ERROR         | "Database error occurred"           | DB connection/query failed        | Check database logs                |
| 500-002 | EXTERNAL_SERVICE_ERROR | "External service error: {service}" | Razorpay/Cloudinary/etc. failed   | Check service status               |
| 500-003 | PAYMENT_GATEWAY_ERROR  | "Payment gateway error: {error}"    | Razorpay API returned error       | Check Razorpay logs/dashboard      |
| 500-004 | UPLOAD_ERROR           | "File upload failed: {reason}"      | Cloudinary upload failed          | Check file size/format/permissions |
| 500-005 | EMAIL_SEND_ERROR       | "Failed to send email"              | Email service failed              | Check email configuration          |
| 500-006 | PDF_GENERATION_ERROR   | "Failed to generate PDF"            | PDFKit error                      | Check invoice data                 |
| 500-007 | CACHE_ERROR            | "Cache operation failed"            | Redis connection/operation failed | Check Redis status                 |
| 500-008 | QUEUE_ERROR            | "Job queue error"                   | BullMQ job failed                 | Check job queue logs               |
| 500-009 | UNKNOWN_ERROR          | "An unexpected error occurred"      | Unhandled exception               | Check server logs                  |

### 503 - Service Unavailable

| Code    | Name                  | Message                                   | Cause                       | Fix                       |
| ------- | --------------------- | ----------------------------------------- | --------------------------- | ------------------------- |
| 503-001 | SERVICE_UNAVAILABLE   | "Service temporarily unavailable"         | Server maintenance/overload | Retry after 5 minutes     |
| 503-002 | DATABASE_UNAVAILABLE  | "Database unavailable"                    | DB maintenance/down         | Check database status     |
| 503-003 | PAYMENT_SERVICE_DOWN  | "Payment service unavailable"             | Razorpay down               | Check Razorpay status     |
| 503-004 | EXTERNAL_SERVICE_DOWN | "External service unavailable: {service}" | Third-party service down    | Check service status page |

---

## 📊 Error Code by Feature

### Authentication (401, 403)

```
401-001: NO_TOKEN
401-002: INVALID_TOKEN
401-003: TOKEN_EXPIRED
401-004: INVALID_CREDENTIALS
401-005: ACCOUNT_SUSPENDED
401-006: EMAIL_NOT_VERIFIED
401-007: REFRESH_TOKEN_EXPIRED
401-008: INVALID_REFRESH_TOKEN

403-001: PERMISSION_DENIED
403-002: ADMIN_ONLY
403-003: GUIDE_ONLY
403-004: MODERATOR_ONLY
```

### User Management (400, 404)

```
400-002: INVALID_EMAIL
400-003: INVALID_PASSWORD
400-005: DUPLICATE_EMAIL
400-014: MISSING_FIELD

404-001: USER_NOT_FOUND
```

### Trips & Bookings (400, 403, 404, 409)

```
400-008: INVALID_DIFFICULTY
400-009: INVALID_DATE_RANGE
400-010: INVALID_PERSON_COUNT
400-012: INSUFFICIENT_SPOTS

403-005: NOT_OWNER
403-007: TRIP_NOT_YOURS

404-002: TRIP_NOT_FOUND
404-003: BOOKING_NOT_FOUND

409-001: DUPLICATE_BOOKING
409-005: BOOKING_ALREADY_PAID
409-006: BOOKING_ALREADY_CANCELLED
409-008: TRIP_NOT_PUBLISHED
```

### Payments (400, 403, 404, 409, 500)

```
400-006: INVALID_AMOUNT
400-013: INVALID_SIGNATURE

403-007: CANNOT_REFUND_PAID

404-004: PAYMENT_NOT_FOUND

409-007: PAYMENT_ALREADY_CAPTURED

500-003: PAYMENT_GATEWAY_ERROR
503-003: PAYMENT_SERVICE_DOWN
```

### Reviews & Ratings (400, 404, 409)

```
400-011: INVALID_RATING

404-005: REVIEW_NOT_FOUND

409-002: DUPLICATE_REVIEW
```

### Blogs & Content (404, 409)

```
404-006: BLOG_NOT_FOUND

409-009: SLUG_ALREADY_EXISTS
```

### File Uploads (500)

```
500-004: UPLOAD_ERROR
```

### Emails (500)

```
500-005: EMAIL_SEND_ERROR
```

---

## 🎯 Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "400-001",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2026-01-17T10:30:45Z",
  "path": "/api/users/register"
}
```

### Error Response Fields

| Field           | Type    | Description                                      |
| --------------- | ------- | ------------------------------------------------ |
| `success`       | boolean | Always `false` for errors                        |
| `error.code`    | string  | Error code (XXX-YYY format)                      |
| `error.message` | string  | Human-readable error message                     |
| `error.details` | array   | Optional field-specific errors (validation only) |
| `timestamp`     | string  | ISO 8601 timestamp                               |
| `path`          | string  | API endpoint path                                |

---

## 🔍 Debugging Guide

### How to Read Error Codes

1. **First 3 digits (HTTP status)**
   - 4xx = Client error (your request issue)
   - 5xx = Server error (our problem)

2. **Last 3 digits (error identifier)**
   - 001-099 = General/common errors
   - 100-199 = Authentication
   - 200-299 = Resource not found
   - 300-399 = Conflicts/duplicates

3. **Message details**
   - Validation errors include field names
   - External service errors include which service
   - Resource errors include resource type

### Common Troubleshooting

**"No authentication token"** → Add `Authorization: Bearer <token>` header

**"Token expired"** → Use refresh token to get new access token

**"Permission denied"** → You need `{permission}` role, contact admin

**"Not found"** → Check resource ID is correct and user owns it

**"Validation failed"** → Review `details` array for field-specific errors

**"External service error"** → Check service status page, retry after 5 minutes

---

## 🚀 Best Practices

1. **Always check error code first** - Don't just read message
2. **Look at details array** - Validation errors have field-specific info
3. **Log full error response** - Helps with debugging
4. **Don't expose error details to users** - Keep security/privacy
5. **Implement retry logic** for 5xx errors (exponential backoff)
6. **Cache successful responses** to reduce errors

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
