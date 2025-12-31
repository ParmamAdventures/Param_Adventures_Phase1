# Param Adventures 🏔️

**Param Adventures** is a premium adventure travel platform designed for high-scale holiday planning, expedition management, and community storytelling. Built with a modern TypeScript monorepo architecture, it offers a seamless experience from booking to on-site expedition execution.

---

## 🚀 Key Features

- **🏔️ Expedition Lifecycle**: Full management from DRAFT to PUBLISHED, including multi-day itinerary building with interactive meal and activity planning.
- **💳 Secure Payments**: Integrated Razorpay checkout with server-side HMAC verification and instant webhook processing.
- **🛡️ Enterprise RBAC**: Granular permission-based access control with specialized portals for Admins, Managers, and Guides.
- **🔔 Real-time Engagement**: Live seat availability, instant booking alerts via Socket.io, and automated transactional emails with BullMQ.
- **📝 Journal & Community**: Rich-text blog editor with dynamic templates for travelers to share their expeditions.
- **📊 Admin Insights**: Real-time analytics dashboard for revenue tracking, booking funnels, and user activity.

---

## 🏗️ Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Backend** | Express.js, Node.js, Prisma ORM (v4.16.2) |
| **Database** | PostgreSQL, Redis (Queues & Pub/Sub) |
| **Infrastructure** | BullMQ (Workers), Socket.io (Real-time), Sharp (Image Prep) |
| **Testing** | Playwright (E2E), Jest (Unit), Supertest (API) |

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Docker)
- Redis

### 1. Environment Configuration
Copy environment templates and populate secrets (Database URL, JWT Secret).
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 2. Dependency Installation
```bash
npm install
```

### 3. Database Initialization
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
node prisma/seed_users.js # Optional: Demo accounts
```

### 4. Start Development
```bash
# In Root
npm run dev
```
- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)
- **Swagger**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## 🔑 Demo Access
Use these accounts with password `password123`:
- `superadmin@local.test` (System Owner)
- `admin@local.test` (Content Moderator)
- `guide@local.test` (Expedition Lead)
- `user@local.test` (Traveler)

---

## 📚 Documentation
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Standards & Patterns](docs/API_GUIDE.md)
- [Roles & Permissions](docs/ROLES_PERMISSIONS.md)
- [Testing Strategy](docs/TEST_PLAN.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
