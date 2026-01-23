# 🛠️ Project Maintenance & Release Guide

This guide outlines the professional strategy for managing branches, releases, and deployments for **Param Adventures**.

---

## 1. 🌿 Branching Strategy (Recommended)

To maintain a stable production environment, avoid working directly on the `main` branch. Use the following hierarchy:

| Branch      | Purpose                                              | Deployment Environment     |
| :---------- | :--------------------------------------------------- | :------------------------- |
| `main`      | **Production**. Stable, tested code only.            | Production (Render/Vercel) |
| `staging`   | **Pre-release Testing**. Final integration check.    | Staging Environment        |
| `develop`   | **Active Integration**. All new features merge here. | Development / Preview      |
| `feature/*` | **Task-based branches** (e.g., `feature/login-fix`). | Local development          |

### Workflow:

1. Create a `feature/xyz` branch from `develop`.
2. Commit your changes and push to GitHub.
3. Open a **Pull Request (PR)** to `develop`.
4. Once tested, merge `develop` into `staging`.
5. After final sign-off, merge `staging` into `main`.

---

## 2. 🚀 Release Process

When you are ready to release a new version (e.g., Version 1.0.0):

1. **Tag the commit**:
   ```bash
   git checkout main
   git tag -a v1.0.0 -m "Release Version 1.0.0"
   git push origin v1.0.0
   ```
2. **GitHub Release**: Go to GitHub -> Releases -> Draft a new release. Select the tag `v1.0.0`, add a title (e.g., "The Himalayan Launch"), and list the new features/fixes.

---

## 3. 🏗️ Deployment & Database Management

### Avoiding Duplicate entries

The project is now configured for **Idempotent Seeding**.

- The seed script (`prisma/seeds/production/index.ts`) will now check if a record exists before creating it.
- **NEVER** use `npx prisma db push --force-reset` in production.

### Deployment Commands on Render/Vercel

| Action              | Recommended Command         |
| :------------------ | :-------------------------- |
| **Build**           | `npm run build`             |
| **Release Command** | `npx prisma migrate deploy` |
| **Start**           | `npm start`                 |

> [!WARNING]  
> **Migration vs. Seeding**:
> Use `npx prisma migrate deploy` for every push. This applies schema changes without deleting data.
> Only run `npx prisma db seed` manually when you need to populate _new_ system data (like new categories).

---

## 4. 🚨 Incident Response (Kill Switches)

If something breaks in production:

1. Use the [ROLLBACK.md](file:///ROLLBACK.md) script.
2. Use environment variables as "Kill Switches":
   - `ENABLE_BOOKINGS=false` (Stops all new booking requests)
   - `ENABLE_PAYMENTS=false` (Stops checkout flow)

---

## 5. 🧪 Testing Strategy (Local & CI)

Since external services (Razorpay, SMTP) may not be configured in every environment, follow this guide to test effectively.

### A. Testing Payments (Without Real Keys)

1. **Data Simulation**:
   - The backend is designed to "Simulate" payments when running in `development` mode if real keys are missing.
   - **Action**: When you click "Pay", look for the **"Simulate Payment"** button (yellow) if the real gateway fails to load.
   - _Note: If this feature is missing, ask the dev team to re-apply the "Dev Fallback" patch._

2. **Manual DB Override**:
   - You can manually mark a booking as PAID in the database to test the "Post-Booking" flow.
   - **SQL**: `UPDATE "Booking" SET "paymentStatus" = 'PAID', "status" = 'CONFIRMED' WHERE id = '...';`

### B. Testing Emails (Without SMTP)

1. **Console Logging**:
   - In Development, emails are logged to the backend console instead of being sent.
   - Check the terminal where `npm run dev` is running to see the email content.

2. **Ethereal Email (Fake Inbox)**:
   - Set `SMTP_HOST=smtp.ethereal.email` (and credentials) to view emails in a web interface.
   - [Create Ethereal Account](https://ethereal.email/)

### C. Workflow Summary

1. **Develop**: Write code on `feature/*`. Test with mock payments/emails locally.
2. **PR**: Merge to `develop`. (CI runs unit tests).
3. **Staging**: Deploy to Render/Vercel Staging. Use "Test Mode" keys for Razorpay here if available.
4. **Production**: Deploy to Main. REAL money, REAL emails.

---

## 📅 Next Steps

1. **Merge your last push** into a new `develop` branch.
2. **Setup Staging** environments on Render and Vercel connected to the `staging` branch.
3. **Turn off auto-build** on `main`. Only trigger it via PR merge from `staging`.
