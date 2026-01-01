# Contributing to Param Adventures

Thank you for your interest in contributing! This guide helps new developers understand our workflow and standards.

## 1. Git Workflow 🌳

### Branch Naming
We follow a standard naming convention for branches:
- `feat/`: New features (e.g., `feat/auth-flow`, `feat/trip-booking`)
- `fix/`: Bug fixes (e.g., `fix/login-error`, `fix/mobile-layout`)
- `docs/`: Documentation updates (e.g., `docs/api-guide`)
- `refactor/`: Code improvements without logic changes (e.g., `refactor/auth-service`)
- `chore/`: Build tasks, dependency updates (e.g., `chore/bump-deps`)

### Commit Messages
We encourage [Conventional Commits](https://www.conventionalcommits.org/):
- **Structure**: `<type>: <description>`
- **Examples**:
  - `feat: add user profile page`
  - `fix: resolve crash on login`
  - `docs: update readme`

## 2. Project Structure 🏗️

This is a Monorepo using `npm` workspaces:
- **apps/web**: Next.js 14 Frontend.
- **apps/api**: Express.js Backend.
- **apps/e2e**: Playwright E2E Tests.

### Commands
- **Install**: `npm install` (Root)
- **Dev**: `npm run dev` (Starts API on 3001, Web on 3000)
- **Test (API)**: `cd apps/api && npm test`
- **Lint**: `npm run lint`

## 3. Code Standards 🧹

### Linting & Formatting
- We use **ESLint** and **Prettier**.
- Run `npm run format` before committing.
- Ensure no console warnings remain.

### Logic
- **Backend**:
  - Use `catchAsync` for controllers.
  - Use `ApiResponse` for consistent JSON output.
  - Ensure logic is in `services/`, not controllers whenever possible.
- **Frontend**:
  - Use `apiFetch` wrapper for all API calls.
  - Ensure Responsive Design (Mobile First).

## 4. Testing ✅
- **Unit Tests**: Required for new Backend Services/Controllers.
- **E2E**: Critical user flows must be verified in `apps/e2e`.

## 5. Pull Requests (PR) 🔀
1. Push your branch.
2. Create PR to `main` (or active feature branch).
3. Ensure CI checks pass (Lint + Test).
4. Request review from a team member.

## 6. Issue Reporting 🐛
- Use the **Bug Report** template for defects.
- Use the **Feature Request** template for new ideas.
- All PRs must follow the **Pull Request Template** to ensure quality checks.

## 7. Development Tools 🛠️
- **Vercel Preview**: Every branch push generates a unique Preview URL. Use this to verify your changes in a live environment before merging.
