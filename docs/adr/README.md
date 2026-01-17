# Architecture Decision Records (ADRs)

This directory contains architecture decisions made during Param Adventures development.

## Index

1. [ADR-001: TypeScript for Type Safety](#adr-001-typescript-for-type-safety)
2. [ADR-002: Next.js for Frontend](#adr-002-nextjs-for-frontend)
3. [ADR-003: Express.js for API](#adr-003-expressjs-for-api)
4. [ADR-004: PostgreSQL for Data](#adr-004-postgresql-for-data)
5. [ADR-005: Prisma ORM](#adr-005-prisma-orm)
6. [ADR-006: Redis for Caching](#adr-006-redis-for-caching)
7. [ADR-007: BullMQ for Jobs](#adr-007-bullmq-for-jobs)
8. [ADR-008: JWT for Auth](#adr-008-jwt-for-authentication)
9. [ADR-009: Razorpay for Payments](#adr-009-razorpay-for-payments)
10. [ADR-010: Docker for Deployment](#adr-010-docker-for-deployment)

---

## ADR-001: TypeScript for Type Safety

**Status**: Accepted

**Context**
Need to build a scalable system with multiple developers, reducing runtime errors and improving code maintainability.

**Decision**
Use TypeScript throughout the codebase (frontend, backend, and infrastructure).

**Rationale**

- Catches errors at compile time, not runtime
- Improves IDE autocomplete and refactoring
- Better documentation through type definitions
- Easier for new developers to understand code
- Can opt-out with `any` when necessary

**Consequences**

- Longer build times during development
- Requires TypeScript knowledge from team
- Additional tooling configuration needed (tsconfig, eslint, prettier)

**Alternatives Considered**

- JavaScript: Less type safety, higher runtime errors
- Flow: Similar benefits but smaller ecosystem

---

## ADR-002: Next.js for Frontend

**Status**: Accepted

**Context**
Building a customer-facing web application with SEO requirements, real-time updates, and need for rapid development.

**Decision**
Use Next.js 14 with App Router for the frontend.

**Rationale**

- Full-stack React framework with built-in optimizations
- Automatic code splitting and image optimization
- Built-in API routes reduce need for separate backend calls
- Server-side rendering (SSR) for SEO
- Incremental Static Regeneration (ISR) for dynamic content
- Large ecosystem and community support
- TypeScript support out of the box

**Consequences**

- Introduces Node.js runtime requirement in frontend
- Vendor lock-in to Vercel ecosystem (though self-hostable)
- Steeper learning curve vs plain React

**Alternatives Considered**

- React SPA: No SSR/SEO benefits
- Remix: Similar benefits, smaller community
- Svelte: Different paradigm, smaller ecosystem

---

## ADR-003: Express.js for API

**Status**: Accepted

**Context**
Need a lightweight, well-established REST API framework for microservice architecture with predictable routing and middleware.

**Decision**
Use Express.js for the API server.

**Rationale**

- Minimal framework, flexible for custom requirements
- Extensive middleware ecosystem
- Lightweight and fast
- Easy to understand routing
- Industry standard with large community
- Can add features incrementally
- Good for team onboarding

**Consequences**

- Requires more manual setup than Rails/Django
- Not opinionated (can lead to inconsistent code)
- Needs custom validation/error handling

**Alternatives Considered**

- NestJS: More batteries-included, overkill for needs
- Fastify: Newer, potentially faster but less ecosystem
- Koa: Too minimal for requirements

---

## ADR-004: PostgreSQL for Data

**Status**: Accepted

**Context**
Need a robust, ACID-compliant database for financial and user data with complex relationships.

**Decision**
Use PostgreSQL as the primary data store.

**Rationale**

- ACID compliance for data integrity (critical for payments)
- Advanced features: JSON, arrays, full-text search, JSONB
- Excellent performance with indexes and query planning
- Open source with long-term stability
- Proven at scale (used by Spotify, Instagram, etc.)
- Complex relationships (trips, bookings, users)
- Strong security and permissions model

**Consequences**

- Requires database administration knowledge
- Not ideal for unstructured data (use document DB if needed)
- Scaling reads requires replication setup

**Alternatives Considered**

- MongoDB: Flexible schema but weaker ACID support
- MySQL: Simpler but fewer advanced features
- SQLite: Not suitable for production multi-user system

---

## ADR-005: Prisma ORM

**Status**: Accepted

**Context**
Need an ORM that provides type safety, good DX, and automatic migration management while staying close to SQL.

**Decision**
Use Prisma as the primary ORM for database access.

**Rationale**

- Type-safe query builder (vs raw SQL)
- Auto-generated client from schema
- Built-in migrations with version control
- Prisma Studio for visual database browsing
- Excellent TypeScript support
- Works with PostgreSQL, MySQL, MongoDB
- Active development and community

**Consequences**

- Learning curve for Prisma-specific patterns
- Generated code adds to build artifacts
- Some advanced queries may require raw SQL

**Alternatives Considered**

- TypeORM: More mature but heavier
- Sequelize: Older, less type-safe
- Raw SQL: Maximum flexibility but less safety

---

## ADR-006: Redis for Caching

**Status**: Accepted

**Context**
Need fast caching layer for reducing database load, session storage, and rate limiting.

**Decision**
Use Redis as cache and session store.

**Rationale**

- In-memory storage for sub-millisecond latency
- Pub/sub for real-time features
- Data structures: strings, hashes, sets, sorted sets
- Session persistence across server restarts
- Built-in expiry (TTL) for cache management
- Cluster mode for high availability

**Consequences**

- Adds another infrastructure dependency
- Requires memory management and monitoring
- Data is volatile (need backups)
- Requires Redis expertise on team

**Alternatives Considered**

- Memcached: Simpler but fewer features
- In-process cache: Doesn't scale horizontally
- No cache: Performance degradation

---

## ADR-007: BullMQ for Jobs

**Status**: Accepted

**Context**
Need to handle asynchronous tasks (email, notifications, background processing) without blocking API responses.

**Decision**
Use BullMQ (Redis-backed queue) for background jobs.

**Rationale**

- Leverages existing Redis infrastructure
- Job persistence and retry logic
- Priority queues
- Rate limiting built-in
- Real-time progress tracking
- Excellent for email and webhooks
- Better than spawning child processes

**Consequences**

- Requires Redis to be always available
- Job processing adds complexity
- Debug harder than synchronous code
- Requires monitoring of queue health

**Alternatives Considered**

- Bull (older version): BullMQ is newer
- Agenda: Requires MongoDB
- Celery (Python): Not Node.js
- RabbitMQ: More complex setup

---

## ADR-008: JWT for Authentication

**Status**: Accepted

**Context**
Need stateless authentication that works across distributed systems without server-side session storage.

**Decision**
Use JWT (JSON Web Tokens) for API authentication with refresh tokens for long-lived access.

**Rationale**

- Stateless authentication (no server session storage)
- Standard format used across industry
- Can be verified without database lookup
- Works with distributed systems and microservices
- Suitable for mobile and SPA clients
- Can include user metadata in token

**Consequences**

- Tokens can't be revoked immediately (only on next request)
- Token size increases bandwidth (though small)
- Requires secure secret management
- Logout requires extra logic (blacklist)

**Alternatives Considered**

- Session cookies: Requires server-side storage
- OAuth2: More complex, might be future migration
- API keys: Less secure for user authentication

---

## ADR-009: Razorpay for Payments

**Status**: Accepted

**Context**
Need PCI-compliant payment processing for Indian market with support for multiple payment methods.

**Decision**
Use Razorpay as payment gateway.

**Rationale**

- India-first payment platform (optimized for INR)
- Multiple payment methods: credit/debit cards, UPI, net banking, wallets
- PCI compliance handled by Razorpay (not stored locally)
- Webhook support for async processing
- Excellent documentation for India
- Settlement to bank account
- Strong security and dispute handling
- Competitive pricing

**Consequences**

- Vendor lock-in (migration difficult)
- Requires webhook infrastructure
- Need to handle payment states and retries
- Merchant account setup overhead

**Alternatives Considered**

- Stripe: International focused, setup more complex for India
- PayU: Older, less developer-friendly API
- Manual bank transfers: No automation, poor UX
- Other Indian gateways: Smaller ecosystems

---

## ADR-010: Docker for Deployment

**Status**: Accepted

**Context**
Need consistent environments across development, staging, and production, with easy scaling and orchestration.

**Decision**
Use Docker and Docker Compose for containerization.

**Rationale**

- Ensures consistency: "runs on my machine" solved
- Easy onboarding: developers don't install PostgreSQL, Redis locally
- Container orchestration ready (Kubernetes path)
- Development mirrors production setup
- Industry standard with large ecosystem
- Easier CI/CD pipeline integration
- Cost-effective resource utilization

**Consequences**

- Learning curve for team (Docker, Compose, networking)
- Adds build step before deployment
- Debugging can be harder in containers
- Requires container registry (Docker Hub, ECR, etc.)

**Alternatives Considered**

- Virtual machines: Heavier, slower
- Manual installation: Inconsistent, hard to scale
- No containerization: Works for small systems, doesn't scale

---

## Decision Record Template

For future decisions, use this format:

```markdown
## ADR-XXX: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**
[Describe the issue/need that prompted this decision]

**Decision**
[What was decided]

**Rationale**
[Why was this decision made - benefits and advantages]

**Consequences**
[What tradeoffs and negative consequences result from this decision]

**Alternatives Considered**
[What other options were evaluated and why rejected]
```

---

## Summary

| ADR | Decision   | Framework   | Status      |
| --- | ---------- | ----------- | ----------- |
| 001 | TypeScript | Language    | ✅ Accepted |
| 002 | Next.js    | Frontend    | ✅ Accepted |
| 003 | Express.js | Backend     | ✅ Accepted |
| 004 | PostgreSQL | Database    | ✅ Accepted |
| 005 | Prisma ORM | Data Access | ✅ Accepted |
| 006 | Redis      | Caching     | ✅ Accepted |
| 007 | BullMQ     | Job Queue   | ✅ Accepted |
| 008 | JWT        | Auth        | ✅ Accepted |
| 009 | Razorpay   | Payments    | ✅ Accepted |
| 010 | Docker     | Deployment  | ✅ Accepted |

---

**Last Updated**: January 17, 2026  
**Maintainer**: Dev Team
