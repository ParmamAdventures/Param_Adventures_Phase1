# Param Adventures — Architecture

## Monorepo Structure

apps/

- web: Next.js frontend
- api: Express backend

packages/

- shared: shared types and utilities (future)

## Principles

- Backend is source of truth
- Permission-based RBAC
- Modular feature-based architecture

## Phase 0 Status

✔ Monorepo initialized  
✔ Backend & frontend skeletons  
✔ Env validation  
✔ Error handling  
✔ CI baseline

### Prisma Version Strategy

- Prisma v4.16.2 is used for stability
- Avoids Accelerate/adapter requirements of v7
- Suitable for Railway + Docker Postgres
- Upgrade evaluated only after core product stabilizes

## Phase 2.1 — Auth Foundations

✔ JWT utilities (access + refresh)  
✔ Password hashing  
✔ Cookie-based session support  
✔ Env validation for auth secrets

## Phase 2.3 — Authorization

✔ Role-based access control  
✔ Permission-based guards  
✔ Super Admin override  
✔ Runtime permission loading

## Phase 2.4 — Frontend Authentication

✔ API client with auto refresh  
✔ Auth context & session hydration  
✔ Login & Signup pages  
✔ Protected routes
