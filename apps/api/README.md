# Param Adventures API

Core backend services for the Param Adventures platform.

## 🚀 Stack

- **Framework**: Express (TypeScript)
- **Database**: PostgreSQL (Supabase/Render) with Prisma ORM
- **Auth**: JWT with Access/Refresh Tokens + RBAC
- **Payments**: Razorpay Integration
- **Monitoring**: Sentry + Winston Logging
- **Validation**: Zod Schemas

---

## 🔐 Role-Based Access Control (RBAC)

The system uses a granular permission system with 6 system roles:

| Role             | Access Level | Description                                                 |
| :--------------- | :----------- | :---------------------------------------------------------- |
| **SUPER_ADMIN**  | Full Access  | Can manage system config, admins, and sensitive operations. |
| **ADMIN**        | High Access  | Manages users, content, trips, and bookings.                |
| **TRIP_MANAGER** | Operational  | Manages specific trips, schedules, and guide assignments.   |
| **TRIP_GUIDE**   | Field Access | View itineraries and assigned trip details using the app.   |
| **UPLOADER**     | Content Only | Can upload photos/videos to the gallery.                    |
| **USER**         | Customer     | Can browse, book trips, and manage their profile.           |

---

## 🛠️ Deployment (Render.com)

This API is configured for seamless deployment on Render.

### Environment Variables

Ensure these variables are set in your Render Service settings:

- `DATABASE_URL`: Connection string to PostgreSQL
- `JWT_SECRET`: Secure string for token signing
- `ADMIN_EMAIL`: Email for the default admin user
- `SEED_PASSWORD`: Common password for all seeded users (e.g., `Demo@123`)
- `SEED_DEMO_DATA`: Set to `true` to generate trips, blogs, and images
- `ALLOW_PROD_SEED`: Set to `true` to enable production seeding
- `FRONTEND_URL`: URL of your frontend (for CORS)

### Auto-Seeding on Deploy

To ensure your database is always ready with fresh data/schema, use this **Build Command**:

```bash
cd ../.. && npm install && npm run build --workspace=api && cd apps/api && npx ts-node prisma/seeds/production/index.ts
```

This command installs dependencies, builds the API, and runs the seed script automatically.

---

## ⚡ Quick Start (Local Development)

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Database Setup**

   ```bash
   # Start local DB (if using Docker) or connection
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Seed Database**

   ```bash
   # Basic Role seeding
   npm run seed

   # Full Demo Data (Recommended)
   npm run seed:prod
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

We use Jest for testing.

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:int
```

## 📝 API Documentation

Swagger documentation is available at `/api-docs` when the server is running.

### Key Endpoints

- `POST /auth/login` - User login
- `GET /trips` - Browse trips (Public)
- `POST /bookings` - Create a new booking
- `GET /admin/dashboard` - Admin analytics

---

## 🛡️ Security Features

- **Rate Limiting**: Protected against brute-force attacks (Login, Payment endpoints).
- **Helmet**: Secure HTTP headers including CSP.
- **CORS**: Strict origin policies for frontend access.
- **Data Integrity**: Soft-delete implemented for Users/Trips to prevent data loss.
