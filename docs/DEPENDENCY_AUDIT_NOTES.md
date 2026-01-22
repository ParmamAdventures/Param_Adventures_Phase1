# Dependency Audit and Verification Notes

Use these steps to validate the recent dependency upgrades across the monorepo (root, apps/api, apps/web):

1. Install and lock
   - From repo root: `npm install`
   - Ensure lockfiles are updated only by intentional changes; do not regenerate with a different package manager.

2. Security and license checks
   - Root: `npm audit --production`
   - API: `cd apps/api && npm audit --production`
   - Web: `cd apps/web && npm audit --production`

3. Static analysis
   - Root lint: `npm run lint` (runs API + Web linters via workspace scripts)
   - API only: `cd apps/api && npm run lint`
   - Web only: `cd apps/web && npm run lint`

4. Tests and builds
   - API tests: `cd apps/api && npm test`
   - API build: `cd apps/api && npm run build`
   - Web build: `cd apps/web && npm run build`

5. Capture results
   - Record audit output (high/critical findings) and test/build results in PR description or release notes.
   - If any audit issues remain, document the risk and planned remediation version.
