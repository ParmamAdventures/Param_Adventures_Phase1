# Param Adventures

**Param Adventures** is a premium adventure tourism platform designed for thrill-seekers to discover, book, and experience curated expeditions—from camping in Spiti Valley to scaling Himalayan peaks.

## 📈 Status (2026-01-16)

- Critical fixes **FIX-001 → FIX-008** completed; ready to proceed to payment features (FEAT-001 to FEAT-004).
- ESLint: 0 `@typescript-eslint/no-unused-vars` warnings across src/scripts/tests.
- Tests: Baseline stable except known payments suite work still planned.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Primary), Redis (Caching & Queues)
- **Infrastructure**: Docker, Vercel (Frontend), Render/DigitalOcean (Backend)
- **Monitoring**: Sentry, Winston Logger

## 📂 Project Structure

This project uses a monorepo-style structure to keep frontend and backend concerns separate but co-located.

```
.
├── apps/
│   ├── api/          # Express.js backend service
│   │   ├── src/      # Source code (Controllers, Services, Routes)
│   │   └── prisma/   # Database schema and migrations
│   └── web/          # Next.js frontend application
│       ├── src/app/  # App Router (Pages & Layouts)
│       └── public/   # Static assets
└── docs/             # API and Architecture documentation
```

## 🛠️ Local Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for DB/Redis)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/ParmamAdventures/Param_Adventures_Phase1.git
    cd Param_Adventures_Phase1
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start Infrastructure**:

    ```bash
    docker-compose up -d
    # Starts PostgreSQL (5433) and Redis (6379)
    ```

4.  **Configure Environment**:
    Create `.env` files in `apps/api` and `apps/web` based on the examples below.

    **backend (`apps/api/.env`)**:

    ```ini
    PORT=3001
    NODE_ENV=development
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/param_adventures?schema=public"
    REDIS_URL="redis://localhost:6379"
    JWT_ACCESS_SECRET="your_secret"
    JWT_REFRESH_SECRET="your_refresh_secret"
    FRONTEND_URL="http://localhost:3000"
    # Optional services (Cloudinary, Sentry, Google OAuth) can be left blank for local dev
    ```

    **frontend (`apps/web/.env.local`)**:

    ```ini
    NEXT_PUBLIC_API_URL="http://localhost:3001"
    ```

5.  **Initialize Database**:

    ```bash
    # Run migrations and seed data
    npm run migrate -w apps/api
    npm run seed -w apps/api
    ```

6.  **Run Applications**:
    ```bash
    npm run dev
    ```

    - **Web**: [http://localhost:3000](http://localhost:3000)
    - **API**: [http://localhost:3001](http://localhost:3001)

## 🚢 Deployment

### Frontend (Vercel)

Connect the repository to Vercel and configure the Root Directory as `apps/web`.

- **Build Command**: `cd ../.. && npm install && npm run build -w apps/web`
- **Output Directory**: `.next`

### Backend (Render / VPS)

Deploy as a Node.js service or Docker container.

- **Build Command**: `npm install && npm run build -w apps/api`
- **Start Command**: `npm run start -w apps/api`
