# Param Adventures

**Param Adventures** is a premium adventure tourism platform designed for thrill-seekers to discover, book, and experience curated expeditions—from camping in Spiti Valley to scaling Himalayan peaks.

🎯 **Status**: Production-Ready (350/350 tests passing ✅)

---

## 📊 Project Progress

### Completion Summary

| Category                       | Count | Status      | Progress     |
| ------------------------------ | ----- | ----------- | ------------ |
| **Critical Fixes**             | 8     | ✅ Complete | 8/8 (100%)   |
| **High Priority Features**     | 13    | ✅ Complete | 13/13 (100%) |
| **Medium Priority Tests**      | 24    | ✅ Complete | 24/24 (100%) |
| **Core Documentation**         | 8     | ✅ Complete | 8/15 (53%)   |
| **Low Priority Optimizations** | 28    | ⏳ Pending  | 0/28 (0%)    |

**Overall**: 58/87 tasks complete (67%) ✅

### Latest Achievements (January 17, 2026)

- ✅ All critical ESLint errors resolved (0 errors, 252 warnings)
- ✅ All 13 high-priority payment features implemented
- ✅ All 24 test suites passing (350 tests)
- ✅ Payment system fully integrated (Razorpay)
- ✅ Email queue system (BullMQ) operational
- ✅ Redis caching configured
- ✅ Comprehensive documentation completed (8 guides)

---

## 🚀 Key Features

### 🎟️ Trip Management

- Browse and filter adventures by difficulty, location, duration
- Create and publish trip itineraries with media
- Real-time availability tracking
- Guide assignment and management

### 💰 Booking & Payments

- Seamless booking workflow with guest details
- **Razorpay integration** for secure payments (UPI, Cards, NetBanking)
- Multiple payment states (Pending → Captured → Refunded)
- Full/partial refund support with audit trail
- Automatic invoice generation (PDF)

### 📧 Notifications

- Order confirmations and payment updates
- Password reset and account notifications
- Admin alerts for new bookings
- Email delivery via BullMQ queue system

### 🔍 Admin Dashboard

- Revenue analytics (monthly, per-trip breakdown)
- Booking management and refund history
- User and guide management
- Blog moderation and publishing

### ⭐ Community Features

- User reviews and ratings (1-5 stars)
- Trip recommendations based on reviews
- Wishlist (saved trips)
- Blog articles about adventures

### 🔐 Security & Auth

- JWT-based authentication (access + refresh tokens)
- Role-based access control (Admin, Guide, User, Moderator)
- Permission-based authorization
- Google OAuth support

---

## 🛠️ Tech Stack

### Frontend

| Layer          | Tech           | Details                  |
| -------------- | -------------- | ------------------------ |
| **Framework**  | Next.js 14     | App Router, SSR/SSG      |
| **UI**         | React 18       | Modern hooks, components |
| **Styling**    | Tailwind CSS   | Utility-first CSS        |
| **State**      | TanStack Query | Server state management  |
| **Icons**      | Lucide React   | Beautiful SVG icons      |
| **Deployment** | Vercel         | Automatic CI/CD          |

### Backend

| Layer          | Tech             | Details                  |
| -------------- | ---------------- | ------------------------ |
| **Runtime**    | Node.js 18+      | JavaScript runtime       |
| **Framework**  | Express.js       | REST API server          |
| **Language**   | TypeScript       | Type-safe code           |
| **ORM**        | Prisma           | Database abstraction     |
| **Validation** | Zod              | Schema validation        |
| **Testing**    | Jest + Supertest | Unit & integration tests |

### Infrastructure

| Component     | Tech           | Purpose               |
| ------------- | -------------- | --------------------- |
| **Database**  | PostgreSQL 14  | Primary data store    |
| **Cache**     | Redis 7        | Session & cache layer |
| **Queue**     | BullMQ         | Async job processing  |
| **Container** | Docker         | Environment isolation |
| **CI/CD**     | GitHub Actions | Automated testing     |

### External Services

| Service          | Purpose             | Config               |
| ---------------- | ------------------- | -------------------- |
| **Razorpay**     | Payment processing  | Production-ready     |
| **Cloudinary**   | Image/media hosting | CDN + storage        |
| **Sentry**       | Error tracking      | Real-time alerts     |
| **Resend/Brevo** | Email delivery      | Transactional emails |

---

## 📂 Project Structure

```
.
├── apps/
│   ├── api/                          # 🔧 Backend (Express + Prisma)
│   │   ├── src/
│   │   │   ├── controllers/          # Request handlers
│   │   │   ├── services/             # Business logic
│   │   │   ├── routes/               # API endpoints
│   │   │   ├── middlewares/          # Auth, validation, errors
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── types/                # TypeScript interfaces
│   │   │   ├── lib/                  # Utilities (auth, queue, cache)
│   │   │   └── app.ts                # Express app setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── migrations/           # Schema migrations
│   │   ├── tests/
│   │   │   ├── integration/          # API endpoint tests
│   │   │   └── unit/                 # Service/util tests
│   │   ├── jest.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                          # 🎨 Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages & layouts
│   │   │   ├── components/           # React components
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities & helpers
│   │   │   ├── styles/               # Global styles
│   │   │   └── types/                # TypeScript types
│   │   ├── public/                   # Static assets
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── e2e/                          # 🎯 End-to-end tests (Playwright)
│       ├── tests/
│       └── playwright.config.ts
│
├── docs/                             # 📚 Documentation
│   ├── API_GUIDE.md                  # API endpoints & usage
│   ├── PAYMENT_INTEGRATION_GUIDE.md   # Payment system setup
│   ├── TESTING_DEVELOPER_GUIDE.md     # How to write tests
│   ├── DEPLOYMENT.md                 # Production deployment
│   ├── DATABASE_SCHEMA.md             # Database design
│   ├── API_ERROR_CODES.md             # Error reference
│   ├── QUICK_REFERENCE.md             # Developer cheat sheet
│   ├── ARCHITECTURE.md                # System design
│   └── ROLES_AND_PERMISSIONS.md       # RBAC reference
│
├── scripts/                          # 🔨 Utility scripts
│   ├── debug-db.ts                   # Database debugging
│   └── ...
│
├── docker-compose.yml                # Local dev infrastructure
├── package.json                      # Workspace root
├── tsconfig.json                     # TypeScript config
├── eslint.config.mjs                 # ESLint rules
└── MASTER_TODO_LIST.md               # Project tracking

```

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **Docker & Docker Compose** ([install](https://www.docker.com/products/docker-desktop))
- **Git** ([install](https://git-scm.com))

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/ParmamAdventures/Param_Adventures_Phase1.git
cd Param_Adventures_Phase1

# 2. Install dependencies
npm install

# 3. Start database and cache
docker-compose up -d

# 4. Setup environment variables
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# 5. Setup database
cd apps/api
npx prisma migrate deploy
npm run seed

# 6. Run development servers
npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **API Swagger**: http://localhost:3001/api-docs
- **Database Studio**: `npx prisma studio`
- **Redis**: localhost:6379

### Environment Variables

**Backend (`apps/api/.env.local`)**:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/param_adventures"
REDIS_URL="redis://localhost:6379"

# Auth
JWT_ACCESS_SECRET="dev_access_secret_change_in_prod"
JWT_REFRESH_SECRET="dev_refresh_secret_change_in_prod"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# URLs
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:3001"

# Optional (leave blank for local dev)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend (`apps/web/.env.local`)**:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 🧪 Testing

### Unit & Integration Tests (API)

```bash
cd apps/api
npm test
```

**Results**: 31/31 suites passing, 350/350 tests passing ✅

### End-to-End Tests (E2E)

```bash
# Quick start with helper script
cd apps/e2e
pwsh ./run-e2e-local.ps1

# Or manually
npm test

# Interactive UI mode
npm run test:ui

# View test reports
npm run test:report
```

**Prerequisites**: API and Web servers must be running

- API: `http://localhost:3001`
- Web: `http://localhost:3000`

See [E2E_TESTING_GUIDE.md](apps/e2e/E2E_TESTING_GUIDE.md) for comprehensive E2E testing documentation.

### Test Coverage

```bash
# Unit tests with coverage
cd apps/api
npm test -- --coverage

# E2E test results
cd apps/e2e
npx playwright show-report
```

### CI/CD Integration

All tests run automatically in GitHub Actions:

- ✅ **Lint**: Code style validation
- ✅ **Build**: TypeScript compilation
- ✅ **Unit Tests**: 350 API tests
- ✅ **E2E Tests**: 64 browser tests
- ✅ **Artifacts**: Reports & screenshots saved

### Troubleshooting

See [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md) for detailed testing documentation.

---

## 📚 Documentation

| Document                                                          | Purpose                          | Audience              |
| ----------------------------------------------------------------- | -------------------------------- | --------------------- |
| [API_GUIDE.md](docs/API_GUIDE.md)                                 | REST API reference with examples | Developers            |
| [PAYMENT_INTEGRATION_GUIDE.md](docs/PAYMENT_INTEGRATION_GUIDE.md) | Payment system setup & webhooks  | DevOps/Backend        |
| [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md)     | How to write & run tests         | All Developers        |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md)                               | Production deployment guide      | DevOps/Backend        |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)                     | Database design & relationships  | Backend/DevOps        |
| [API_ERROR_CODES.md](docs/API_ERROR_CODES.md)                     | Error codes & troubleshooting    | All Developers        |
| [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)                     | Developer cheat sheet            | All Developers        |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)                           | System design & patterns         | Architects/Tech Leads |
| [ROLES_AND_PERMISSIONS.md](docs/ROLES_AND_PERMISSIONS.md)         | RBAC system reference            | Backend/Admin         |

---

## 🚀 Common Development Tasks

### Add a New API Endpoint

1. Create controller: `apps/api/src/controllers/trips/createTrip.controller.ts`
2. Add route: `apps/api/src/routes/trips.routes.ts`
3. Add test: `apps/api/tests/integration/trips.test.ts`
4. Document in [API_GUIDE.md](docs/API_GUIDE.md)

### Write a New Test

```bash
# Create test file
touch apps/api/tests/integration/feature.test.ts

# Run tests in watch mode
npm test -- --watch feature.test.ts
```

See [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md) for detailed examples.

### Database Schema Changes

```bash
# 1. Update schema.prisma
vim apps/api/prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Test migration
npm test

# 4. Commit changes
git add apps/api/prisma/migrations/
git commit -m "feat: add new field to User model"
```

### Deploy to Production

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions.

---

## 🔗 API Example

### Create a Booking

```bash
curl -X POST http://localhost:3001/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "clxx1a2b3c4d5e6f7g8h9i0j",
    "numPeople": 2,
    "checkInDate": "2026-02-15",
    "specialRequests": "Vegetarian meals"
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "clxx1a2b3c4d5e6f7g8h9i0j",
    "bookingRef": "PA-20260117-001",
    "status": "PENDING",
    "totalPrice": 30000,
    "createdAt": "2026-01-17T10:30:00Z"
  }
}
```

More examples in [API_GUIDE.md](docs/API_GUIDE.md) and [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md).

---

## 🐛 Troubleshooting

**Database connection error?**

- Check Docker: `docker-compose ps`
- Verify DATABASE_URL in `.env`
- Reset: `docker-compose down && docker-compose up -d`

**Tests failing?**

- See [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md#troubleshooting)
- Check logs: `npm test -- --verbose`
- Reset DB: `npx prisma migrate reset`

**API not responding?**

- Check health: `curl http://localhost:3001/health`
- View logs: `npm run dev -- 2>&1 | tail -50`
- See [API_ERROR_CODES.md](docs/API_ERROR_CODES.md)

---

## 📊 Monitoring & Logs

### View Logs

```bash
# API logs
npm run dev

# Database logs
docker logs param_adventures_db

# Redis logs
docker logs param_adventures_redis
```

### Health Check

```bash
curl http://localhost:3001/health
```

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm test`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request on GitHub
6. Code review and merge

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ParmamAdventures/Param_Adventures_Phase1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ParmamAdventures/Param_Adventures_Phase1/discussions)
- **Documentation**: See [docs/](docs/) directory
- **Email**: [support@paramadventures.com](mailto:support@paramadventures.com)

---

## 📅 Roadmap

### Phase 2 (Current)

- ✅ Payment system integration
- ✅ Core documentation
- ⏳ Performance optimizations (caching, indexing)
- ⏳ E2E tests
- ⏳ Mobile app support

### Phase 3 (Future)

- Multi-language support
- Advanced analytics
- Social features (groups, sharing)
- Loyalty program
- Marketplace (guide services, gear rentals)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

## 🚢 Deployment

### Frontend (Vercel)

Connect the repository to Vercel and configure the Root Directory as `apps/web`.

- **Build Command**: `cd ../.. && npm install && npm run build -w apps/web`
- **Output Directory**: `.next`

### Backend (Render / VPS)

Deploy as a Node.js service or Docker container.

- **Build Command**: `npm install && npm run build -w apps/api`
- **Start Command**: `npm run start -w apps/api`
