# Development Workflow

To ensure stability and leverage our CI/CD pipeline effectively, we follow this **Feature Branch Workflow**.

## 1. Start Fresh
Always start from an up-to-date `main` branch.
```bash
git checkout main
git pull origin main
```

## 2. Create a Branch
Use a descriptive name with a prefix:
- `feat/` for new features (e.g., `feat/user-profiles`)
- `fix/` for bugs (e.g., `fix/login-error`)
- `chore/` for maintenance (e.g., `chore/update-deps`)

```bash
git checkout -b feat/my-new-feature
```

## 3. Develop & Verify Locally
Make your changes and test them on your machine.
- Frontend: `npm run dev` (localhost:3000)
- Backend: `npm run dev` (localhost:4000)

## 4. Push Branch (Pro Tip: Preview Environments)
**Recommended:** Push your branch *before* merging.
```bash
git push -u origin feat/my-new-feature
```
**Why?**
- **Vercel** will automatically deploy a **Preview URL** (e.g., `param-adventures-git-feat-user.vercel.app`).
- **Render** will deploy a Preview Backend (if configured) or you can test against the existing Dev backend.
- This lets you verify **Serverless Functions** and **Auth Proxies** in a real environment without breaking Production.

## 5. Merge to Main
Once verified (Locally + Preview), merge it into main.

```bash
git checkout main
git merge feat/my-new-feature
git push origin main
```
*This triggers the Production Deployment.*

## 6. Cleanup
Delete the feature branch to keep things tidy.
```bash
git branch -d feat/my-new-feature
```
