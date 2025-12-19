# Param Adventures

Production-grade adventure travel platform.

## Status

🚧 In active development

## Tech Stack

- Frontend: Next.js (App Router), TypeScript
- Backend: Node.js, Express, TypeScript (API server under `apps/api`)
- Database: PostgreSQL (Prisma)
- Infrastructure: Railway, Vercel

## Repository Layout

- `apps/web` — Next.js frontend (App Router). Main UI, components, pages, and client code.
- `apps/api` — Backend API and Prisma schema/migrations.
- `packages/shared` — Shared utilities/types used by apps.
- `docs` — Project documentation and test plan.

## Running the web app (local)

From repository root:

```bash
cd apps/web
npm install
npm run dev       # start Next dev server (http://localhost:3000)
```

Build for production:

```bash
cd apps/web
npm run build
npm run start
```

## Tests

- Unit tests: run from `apps/web`:

```bash
cd apps/web
npm test
```

- Manual test plan: see `docs/TEST_PLAN.md` for manual QA cases (toasts, payments, admin flows, skeletons).

## Key UI primitives and features

- Toasts: `apps/web/src/components/ui/ToastProvider.tsx` + `ToastViewport.tsx` — client-only, theme-aware, framer-motion based.
- Motion wrappers: `MotionCard`, `MotionButton` for consistent animations (framer-motion presets).
- Skeletons: client-loaded skeletons and `TripsClient` to show placeholders while fetching.
- Buttons, ErrorBlock, Spinner: core UI primitives used site-wide.

## Contributing

- Add unit tests for UI changes under `apps/web/src/components` and update `docs/TEST_PLAN.md` for manual test cases.
- Open a branch for feature work and create PRs against `main`.

## More

- App-specific README: `apps/web/README.md`
- Test plan: `docs/TEST_PLAN.md`

## Testing & QA

- Unit tests: run `npm test` in `apps/web`.
- Manual test plan: see `docs/TEST_PLAN.md` for test cases, environment, and run steps.

## Contributing

- For UI changes, include unit tests under `apps/web/src/components` and update `docs/TEST_PLAN.md` with any new manual cases.
