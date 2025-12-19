This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
This is a [Next.js](https://nextjs.org) project using the App Router.

## Getting Started (local)

Install dependencies and run the dev server:

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Important scripts

- `npm run dev` — start Next dev server
- `npm run build` — build production output
- `npm run start` — start the built app
- `npm test` — run unit tests (Jest)

## Project structure (important files)

- `src/app` — route handlers and pages (App Router)
- `src/components` — UI components and primitives
  - `src/components/ui` — Button, Card, Spinner, ErrorBlock, ToastProvider, ToastViewport, Skeletons
  - `src/components/trips` — trip listing, forms, booking card
- `src/context` — auth and permission helpers
- `prisma` — database schema and migrations (in `apps/api`)

## UI notes and QA

- Toasts: implemented in `src/components/ui/ToastProvider.tsx` and `ToastViewport.tsx` (framer-motion, theme-aware, client-only). Use `useToast()` in client components.
- Motion: `MotionCard` and `MotionButton` provide consistent animation presets.
- Skeletons: client-side skeletons are used for Trips and Blogs pages to improve perceived performance.
- Tests: UI unit tests live under `src/components/ui/__tests__`.

## Manual QA and test plan

See `../docs/TEST_PLAN.md` for the canonical manual test cases and environment notes.

## Deploy

Prefer deploying to Vercel. Ensure environment variables (e.g., `NEXT_PUBLIC_API_URL`) point to the correct API.

Run unit tests and the dev server from the `apps/web` directory:

```bash
npm install
npm test
npm run dev
```

See the central test plan at `../docs/TEST_PLAN.md` for manual test cases and QA steps.
