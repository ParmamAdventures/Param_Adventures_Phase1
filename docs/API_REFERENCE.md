# API Reference - Param Adventures

Complete REST API documentation with request/response examples.

**Base URL**: `https://api.paramadventures.com` (Production)  
**Base URL**: `http://localhost:3001` (Development)

**Swagger UI**: `/api-docs` (Interactive documentation)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Trips](#trips)
3. [Bookings](#bookings)
4. [Users](#users)
5. [Payments](#payments)
6. [Reviews](#reviews)
7. [Blogs](#blogs)
8. [Media](#media)
9. [Admin](#admin)
10. [Response Format](#response-format)
11. [Error Codes](#error-codes)

---

## 🔐 Authentication

### Register

Creates a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["USER"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules**:

- `name`: 2-100 characters
- `email`: Valid email format, unique
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

---

### Login

Authenticates user and returns tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["USER"],
      "permissions": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Cookies Set**:

- `refreshToken`: HttpOnly, Secure, 7 days expiry

---

### Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Headers**:

```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200):

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User

Get authenticated user details.

**Endpoint**: `GET /auth/me`

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "nickname": "Johnny",
      "bio": "Adventure enthusiast",
      "avatarImage": {
        "url": "https://res.cloudinary.com/..."
      },
      "roles": ["USER"],
      "permissions": []
    }
  }
}
```

---

### Logout

Invalidates refresh token.

**Endpoint**: `POST /auth/logout`

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response** (200):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

Request password reset email.

**Endpoint**: `POST /auth/forgot-password`

**Request Body**:

```json
{
  "email": "john@example.com"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### Reset Password

Reset password using token from email.

**Endpoint**: `POST /auth/reset-password/:token`

**Request Body**:

```json
{
  "password": "NewSecurePass123!"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 🏔️ Trips

### List Trips (Public)

Get paginated list of published trips.

**Endpoint**: `GET /trips/public`

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `category` (TREK, CAMPING, CORPORATE, etc.)
- `minPrice` (number)
- `maxPrice` (number)
- `duration` (number of days)
- `difficulty` (Easy, Moderate, Challenging, Extreme)
- `search` (search in title/description)
- `sortBy` (price, duration, createdAt)
- `order` (asc, desc)

**Example**:

```
GET /trips/public?category=TREK&minPrice=5000&maxPrice=15000&difficulty=Moderate
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "cm4xyz789",
        "title": "Manali Snow Trek",
        "slug": "manali-snow-trek",
        "category": "TREK",
        "price": 12000,
        "duration": 5,
        "difficulty": "Moderate",
        "startDate": "2026-03-15T00:00:00.000Z",
        "endDate": "2026-03-20T00:00:00.000Z",
        "coverImage": {
          "url": "https://res.cloudinary.com/..."
        },
        "description": "Experience the majestic...",
        "highlights": ["Stunning views", "Expert guides"],
        "avgRating": 4.5,
        "reviewCount": 23,
        "featured": true
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### Get Trip by Slug (Public)

Get detailed information about a specific trip.

**Endpoint**: `GET /trips/public/:slug`

**Example**:

```
GET /trips/public/manali-snow-trek
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "cm4xyz789",
      "title": "Manali Snow Trek",
      "slug": "manali-snow-trek",
      "category": "TREK",
      "price": 12000,
      "duration": 5,
      "difficulty": "Moderate",
      "startDate": "2026-03-15T00:00:00.000Z",
      "endDate": "2026-03-20T00:00:00.000Z",
      "description": "Detailed description...",
      "highlights": ["Stunning views", "Expert guides", "All meals included"],
      "inclusions": ["Accommodation", "Meals", "Guide", "Transport"],
      "exclusions": ["Travel insurance", "Personal expenses"],
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival in Manali",
          "description": "Check-in and orientation..."
        },
        {
          "day": 2,
          "title": "Trek to Base Camp",
          "description": "Start the trek..."
        }
      ],
      "faqs": [
        {
          "question": "What fitness level is required?",
          "answer": "Moderate fitness required..."
        }
      ],
      "coverImage": {
        "url": "https://res.cloudinary.com/..."
      },
      "heroImage": {
        "url": "https://res.cloudinary.com/..."
      },
      "gallery": [
        { "url": "https://res.cloudinary.com/..." },
        { "url": "https://res.cloudinary.com/..." }
      ],
      "reviews": [
        {
          "id": "cm4rev123",
          "rating": 5,
          "title": "Amazing experience!",
          "comment": "Best trip ever...",
          "user": {
            "name": "Jane Smith",
            "avatarImage": { "url": "..." }
          },
          "createdAt": "2026-01-10T00:00:00.000Z"
        }
      ],
      "avgRating": 4.5,
      "reviewCount": 23,
      "maxGroupSize": 15,
      "currentBookings": 8,
      "spotsLeft": 7,
      "manager": {
        "name": "Trip Manager Name",
        "email": "manager@paramadventures.com"
      },
      "guides": [
        {
          "name": "Guide Name",
          "bio": "Experienced guide..."
        }
      ]
    }
  }
}
```

---

### Create Trip (Admin)

Create a new trip.

**Endpoint**: `POST /trips`

**Authentication**: Required (Admin/Trip Manager)

**Request Body**:

```json
{
  "title": "Ladakh Bike Expedition",
  "slug": "ladakh-bike-expedition",
  "category": "CUSTOM",
  "description": "Epic motorcycle journey...",
  "highlights": ["Khardung La Pass", "Nubra Valley"],
  "price": 35000,
  "duration": 10,
  "difficulty": "Challenging",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-10T00:00:00.000Z",
  "maxGroupSize": 10,
  "inclusions": ["Royal Enfield rental", "Fuel", "Mechanic support"],
  "exclusions": ["Flights to Leh", "Personal gear"],
  "itinerary": [
    {
      "day": 1,
      "title": "Leh Arrival",
      "description": "Acclimatization day"
    }
  ],
  "coverImageId": "cm4img123",
  "managerId": "cm4user456",
  "guideIds": ["cm4user789"]
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "trip": {
      "id": "cm4xyz890",
      "title": "Ladakh Bike Expedition",
      "slug": "ladakh-bike-expedition",
      "status": "DRAFT",
      ...
    }
  }
}
```

---

### Update Trip (Admin)

Update existing trip.

**Endpoint**: `PATCH /trips/:id`

**Authentication**: Required (Admin/Trip Manager)

**Request Body**: (Send only fields to update)

```json
{
  "price": 33000,
  "description": "Updated description..."
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Trip updated successfully",
  "data": {
    "trip": {...}
  }
}
```

---

### Publish Trip (Admin)

Change trip status to PUBLISHED.

**Endpoint**: `PATCH /trips/:id/publish`

**Authentication**: Required (Admin/Trip Manager)

**Response** (200):

```json
{
  "success": true,
  "message": "Trip published successfully"
}
```

---

### Delete Trip (Admin)

Delete a trip (only if no bookings exist).

**Endpoint**: `DELETE /trips/:id`

**Authentication**: Required (Super Admin/Admin)

**Response** (200):

```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

---

## 📅 Bookings

### Create Booking

Book a trip (requires authentication).

**Endpoint**: `POST /bookings`

**Authentication**: Required

**Request Body**:

```json
{
  "tripId": "cm4xyz789",
  "guests": [
    {
      "name": "John Doe",
      "age": 30,
      "gender": "Male",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "emergencyContact": "+91-9876543211",
      "specialRequirements": "Vegetarian meals"
    },
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "Female",
      "email": "jane@example.com",
      "phone": "+91-9876543212",
      "emergencyContact": "+91-9876543213"
    }
  ]
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "Booking created. Proceed to payment.",
  "data": {
    "booking": {
      "id": "cm4book123",
      "bookingNumber": "PA202600123",
      "tripId": "cm4xyz789",
      "userId": "cm4abc123",
      "status": "PENDING_PAYMENT",
      "guests": [...],
      "totalAmount": 24000,
      "createdAt": "2026-01-16T10:30:00.000Z"
    }
  }
}
```

---

### Get My Bookings

List all bookings for authenticated user.

**Endpoint**: `GET /bookings/my`

**Authentication**: Required

**Query Parameters**:

- `status` (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `page`, `limit`

**Response** (200):

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "cm4book123",
        "bookingNumber": "PA202600123",
        "status": "CONFIRMED",
        "totalAmount": 24000,
        "trip": {
          "title": "Manali Snow Trek",
          "slug": "manali-snow-trek",
          "startDate": "2026-03-15T00:00:00.000Z",
          "coverImage": {"url": "..."}
        },
        "guests": 2,
        "createdAt": "2026-01-16T10:30:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### Get Booking Details

Get detailed information about a specific booking.

**Endpoint**: `GET /bookings/:id`

**Authentication**: Required (Owner or Admin)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "cm4book123",
      "bookingNumber": "PA202600123",
      "status": "CONFIRMED",
      "totalAmount": 24000,
      "paidAmount": 24000,
      "trip": {
        "title": "Manali Snow Trek",
        "startDate": "2026-03-15T00:00:00.000Z",
        "endDate": "2026-03-20T00:00:00.000Z"
      },
      "guests": [
        {
          "name": "John Doe",
          "age": 30,
          "email": "john@example.com"
        }
      ],
      "payment": {
        "razorpayPaymentId": "pay_xxx",
        "razorpayOrderId": "order_xxx",
        "status": "SUCCESS"
      },
      "createdAt": "2026-01-16T10:30:00.000Z",
      "approvedAt": "2026-01-16T11:00:00.000Z",
      "approvedBy": {
        "name": "Admin Name"
      }
    }
  }
}
```

---

### Cancel Booking

Cancel an existing booking.

**Endpoint**: `PATCH /bookings/:id/cancel`

**Authentication**: Required (Owner or Admin)

**Request Body** (optional):

```json
{
  "reason": "Personal emergency"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Booking cancelled. Refund will be processed as per policy.",
  "data": {
    "booking": {
      "id": "cm4book123",
      "status": "CANCELLED",
      "refundAmount": 21600,
      "refundStatus": "PENDING"
    }
  }
}
```

---

### Approve Booking (Admin)

Approve a pending booking.

**Endpoint**: `PATCH /bookings/:id/approve`

**Authentication**: Required (Admin/Trip Manager)

**Response** (200):

```json
{
  "success": true,
  "message": "Booking approved",
  "data": {
    "booking": {
      "id": "cm4book123",
      "status": "CONFIRMED"
    }
  }
}
```

---

## 👤 Users

### Get User Profile

Get authenticated user's profile.

**Endpoint**: `GET /users/profile`

**Authentication**: Required

**Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "nickname": "Johnny",
      "bio": "Love adventure!",
      "age": 30,
      "gender": "Male",
      "phoneNumber": "+91-9876543210",
      "address": "123 Street, City",
      "avatarImage": {
        "url": "https://res.cloudinary.com/..."
      },
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  }
}
```

---

### Update Profile

Update authenticated user's profile.

**Endpoint**: `PATCH /users/profile`

**Authentication**: Required

**Request Body** (send only fields to update):

```json
{
  "nickname": "JD",
  "bio": "Adventure enthusiast and photographer",
  "age": 31,
  "phoneNumber": "+91-9876543210",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {...}
  }
}
```

---

### Change Password

Change authenticated user's password.

**Endpoint**: `PATCH /users/change-password`

**Authentication**: Required

**Request Body**:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 💳 Payments

### Create Payment Intent

Initialize payment for a booking.

**Endpoint**: `POST /payments/intent`

**Authentication**: Required

**Request Body**:

```json
{
  "bookingId": "cm4book123"
}
```

**Response** (201):

```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 24000,
    "currency": "INR",
    "keyId": "rzp_live_xxx"
  }
}
```

**Usage**: Use this data to initialize Razorpay checkout on frontend.

---

### Verify Payment

Verify payment after Razorpay checkout.

**Endpoint**: `POST /payments/verify`

**Authentication**: Required

**Request Body**:

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**Response** (200):

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "booking": {
      "id": "cm4book123",
      "status": "PENDING",
      "paymentStatus": "SUCCESS"
    }
  }
}
```

---

## ⭐ Reviews

### Create Review

Write a review for a completed trip.

**Endpoint**: `POST /reviews`

**Authentication**: Required

**Request Body**:

```json
{
  "tripId": "cm4xyz789",
  "bookingId": "cm4book123",
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "The trek was absolutely fantastic. Our guide was knowledgeable and the views were breathtaking."
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "cm4rev456",
      "rating": 5,
      "title": "Amazing experience!",
      "comment": "The trek was...",
      "createdAt": "2026-01-16T12:00:00.000Z"
    }
  }
}
```

---

### Get Trip Reviews

Get all reviews for a trip.

**Endpoint**: `GET /reviews/trip/:tripId`

**Query Parameters**:

- `page`, `limit`
- `minRating` (1-5)

**Response** (200):

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "cm4rev456",
        "rating": 5,
        "title": "Amazing experience!",
        "comment": "The trek was...",
        "user": {
          "name": "John Doe",
          "avatarImage": {"url": "..."}
        },
        "createdAt": "2026-01-16T12:00:00.000Z"
      }
    ],
    "pagination": {...},
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 23,
      "distribution": {
        "5": 15,
        "4": 5,
        "3": 2,
        "2": 1,
        "1": 0
      }
    }
  }
}
```

---

## 📝 Blogs

### List Blogs

Get published blogs.

**Endpoint**: `GET /blogs`

**Query Parameters**:

- `page`, `limit`
- `category`
- `tag`
- `search`

**Response** (200):

```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "cm4blog123",
        "title": "10 Tips for First-Time Trekkers",
        "slug": "10-tips-for-first-time-trekkers",
        "excerpt": "Planning your first trek? Here are...",
        "coverImage": {"url": "..."},
        "author": {
          "name": "Jane Smith",
          "avatarImage": {"url": "..."}
        },
        "category": "Tips",
        "tags": ["trekking", "beginners"],
        "publishedAt": "2026-01-10T00:00:00.000Z",
        "readTime": 5
      }
    ],
    "pagination": {...}
  }
}
```

---

### Get Blog by Slug

Get detailed blog post.

**Endpoint**: `GET /blogs/:slug`

**Response** (200):

```json
{
  "success": true,
  "data": {
    "blog": {
      "id": "cm4blog123",
      "title": "10 Tips for First-Time Trekkers",
      "slug": "10-tips-for-first-time-trekkers",
      "content": "Full HTML content...",
      "coverImage": { "url": "..." },
      "author": {
        "name": "Jane Smith",
        "bio": "Travel writer...",
        "avatarImage": { "url": "..." }
      },
      "category": "Tips",
      "tags": ["trekking", "beginners"],
      "publishedAt": "2026-01-10T00:00:00.000Z",
      "readTime": 5
    }
  }
}
```

---

## 📷 Media

### Upload Media

Upload image to Cloudinary.

**Endpoint**: `POST /media/upload`

**Authentication**: Required (Admin/Uploader)

**Request Body** (multipart/form-data):

```
file: [binary image data]
```

**Response** (201):

```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "media": {
      "id": "cm4img789",
      "url": "https://res.cloudinary.com/...",
      "publicId": "paramadventures/xyz123",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "size": 245678
    }
  }
}
```

---

## 🛡️ Admin

### Get Analytics

Get platform analytics.

**Endpoint**: `GET /admin/analytics`

**Authentication**: Required (Admin)

**Query Parameters**:

- `startDate`, `endDate`

**Response** (200):

```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 2450000,
      "thisMonth": 350000,
      "lastMonth": 420000
    },
    "bookings": {
      "total": 156,
      "pending": 12,
      "confirmed": 85,
      "completed": 47
    },
    "trips": {
      "total": 45,
      "published": 38,
      "draft": 7
    },
    "users": {
      "total": 523,
      "newThisMonth": 45
    }
  }
}
```

---

## 📤 Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  }
}
```

---

## ❌ Error Codes

| Code                  | HTTP Status | Description                           |
| --------------------- | ----------- | ------------------------------------- |
| `INVALID_CREDENTIALS` | 401         | Wrong email/password                  |
| `TOKEN_EXPIRED`       | 401         | Access token expired (refresh it)     |
| `UNAUTHORIZED`        | 401         | Authentication required               |
| `FORBIDDEN`           | 403         | Insufficient permissions              |
| `NOT_FOUND`           | 404         | Resource not found                    |
| `VALIDATION_ERROR`    | 400         | Invalid request data                  |
| `DUPLICATE_ENTRY`     | 409         | Resource already exists (e.g., email) |
| `PAYMENT_FAILED`      | 402         | Payment unsuccessful                  |
| `TRIP_FULL`           | 409         | No spots available                    |
| `BOOKING_NOT_ALLOWED` | 403         | Cannot book this trip                 |
| `INTERNAL_ERROR`      | 500         | Server error (contact support)        |

---

## 🔐 Authentication Header

For protected endpoints, include JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Lifecycle**:

1. Login → Get `accessToken` (15 min) and `refreshToken` (7 days)
2. Use `accessToken` for all requests
3. When `accessToken` expires (401), call `/auth/refresh`
4. Get new `accessToken`
5. Repeat

---

## 🚀 Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP (stricter)

**Rate Limit Headers**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

---

## 📚 Additional Resources

- **Swagger UI**: `/api-docs` (Interactive API explorer)
- **Postman Collection**: [Download](./postman_collection.json)
- **Code Examples**: See [GitHub repository](https://github.com/ParmamAdventures/Param_Adventures_Phase1)

---

## 🆘 Support

- **Technical Issues**: dev-support@paramadventures.com
- **API Questions**: api@paramadventures.com
- **Report Bugs**: [GitHub Issues](https://github.com/ParmamAdventures/Param_Adventures_Phase1/issues)

---

**Last Updated**: January 2026  
**API Version**: v1.0
