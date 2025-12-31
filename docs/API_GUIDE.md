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
- **Payments**: `/payments/verify` (Handled via client) and standard webhooks (TBD for full automation).
- **Validation**: Every webhook must be verified via HMAC signature or source IP check.

---

## 🧪 Documentation (OpenAPI)

We use Swagger for interactive API documentation.
- **Annotations**: Use JSDoc comments in route files to describe parameters and responses.
- **Updates**: Update annotations immediately when changing route logic.
