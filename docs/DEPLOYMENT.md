# Deployment Guide

Comprehensive guide for deploying Param Adventures to production.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Deployment (Render.com)](#backend-deployment-rendercom)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Database Migrations](#database-migrations)
7. [Backup & Restore Procedures](#backup--restore-procedures)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Rollback Procedures](#rollback-procedures)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────┐
│   Vercel CDN    │ ← Frontend (Next.js)
└────────┬────────┘
         │ HTTPS
    ┌────▼─────────────────┐
    │  Render Web Service  │ ← Backend (Express/Node.js)
    └────┬─────────────────┘
         │
    ┌────▼────────────┐
    │ Render Postgres │ ← Database
    └─────────────────┘
         │
    ┌────▼────────────┐
    │  Render Redis   │ ← Cache & Job Queue
    └─────────────────┘
```

**External Services:**

- **Cloudinary**: Media storage
- **Razorpay**: Payment processing
- **Sentry**: Error monitoring
- **Resend/Brevo**: Email delivery

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with latest code pushed
- [ ] Render.com account ([render.com](https://render.com))
- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] Cloudinary account ([cloudinary.com](https://cloudinary.com))
- [ ] Razorpay account ([razorpay.com](https://razorpay.com))
- [ ] Sentry projects created (frontend + backend)
- [ ] Email service configured (see [EMAIL_SETUP.md](EMAIL_SETUP.md))
- [ ] Custom domain (optional, but recommended)

---

## Database Setup

### Option 1: Render PostgreSQL (Recommended)

1. **Create Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `param-adventures-db`
   - Region: Choose closest to your backend
   - Plan: Free (90 days) or Starter ($7/month)
   - Click "Create Database"

2. **Get Connection String**
   - After creation, copy the "Internal Database URL"
   - Format: `postgresql://user:pass@dpg-xxxxx/dbname`
   - Save this for backend environment variables

3. **Configure Connection Pooling** (for production)
   - Max Connections: 20 (adjust based on plan)
   - Connection Timeout: 30s

### Option 2: External PostgreSQL

Alternatives: Supabase, Neon, AWS RDS, DigitalOcean

---

## Backend Deployment (Render.com)

### Step 1: Create Web Service

1. **New Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Name: `param-adventures-api`
   - Region: Same as database
   - Branch: `main`

2. **Build Configuration**

   ```
   Root Directory: (leave blank)
   Build Command: npm install && npm run build -w apps/api
   Start Command: npm run start -w apps/api
   ```

3. **Instance Type**
   - Free tier: Good for testing (spins down after 15 min inactivity)
   - Starter ($7/month): Recommended for production

### Step 2: Environment Variables

Go to Environment tab and add ALL variables from `apps/api/.env.example`:

#### Required Variables:

| Variable                  | Example Value                               | Where to Get                                                                         |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`            | `postgresql://user:pass@host/db`            | Render PostgreSQL dashboard                                                          |
| `NODE_ENV`                | `production`                                | -                                                                                    |
| `PORT`                    | `3001`                                      | -                                                                                    |
| `API_URL`                 | `https://param-adventures-api.onrender.com` | Your Render URL                                                                      |
| `FRONTEND_URL`            | `https://paramadventures.com`               | Your Vercel domain                                                                   |
| `CORS_ORIGIN`             | `https://paramadventures.com`               | Same as frontend                                                                     |
| `JWT_ACCESS_SECRET`       | `[64-char random string]`                   | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET`      | `[64-char random string]`                   | Generate same way                                                                    |
| `JWT_ACCESS_EXPIRES_IN`   | `15m`                                       | -                                                                                    |
| `JWT_REFRESH_EXPIRES_IN`  | `7d`                                        | -                                                                                    |
| `REDIS_URL`               | `redis://default:pass@host:6379`            | Render Redis dashboard (see Step 3)                                                  |
| `CLOUDINARY_CLOUD_NAME`   | `your-cloud-name`                           | [Cloudinary Console](https://cloudinary.com/console)                                 |
| `CLOUDINARY_API_KEY`      | `123456789012345`                           | Cloudinary Console                                                                   |
| `CLOUDINARY_API_SECRET`   | `abcdef123456`                              | Cloudinary Console                                                                   |
| `RAZORPAY_KEY_ID`         | `rzp_live_xxxxx`                            | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)                        |
| `RAZORPAY_KEY_SECRET`     | `xxxxx`                                     | Razorpay Dashboard                                                                   |
| `RAZORPAY_WEBHOOK_SECRET` | `[32-char random string]`                   | Generate and configure in Razorpay (see Step 5)                                      |
| `SMTP_HOST`               | `smtp.resend.com`                           | See [EMAIL_SETUP.md](EMAIL_SETUP.md)                                                 |
| `SMTP_PORT`               | `465`                                       | -                                                                                    |
| `SMTP_SECURE`             | `true`                                      | -                                                                                    |
| `SMTP_USER`               | `resend`                                    | Email provider                                                                       |
| `SMTP_PASS`               | `re_xxxxx`                                  | Email provider API key                                                               |
| `SMTP_FROM`               | `noreply@paramadventures.com`               | Your verified domain                                                                 |
| `SENTRY_DSN`              | `https://xxx@sentry.io/xxx`                 | [Sentry Projects](https://sentry.io/settings/projects/)                              |
| `SENTRY_ENVIRONMENT`      | `production`                                | -                                                                                    |
| `SESSION_SECRET`          | `[32-char random string]`                   | Generate same way as JWT                                                             |
| `ENABLE_SWAGGER`          | `true`                                      | -                                                                                    |
| `ENABLE_AUDIT_LOGGING`    | `true`                                      | -                                                                                    |
| `ENABLE_SOCKET_IO`        | `true`                                      | -                                                                                    |

#### Optional Variables:

| Variable               | Description                                 |
| ---------------------- | ------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth (if enabled)                   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret                         |
| `GOOGLE_CALLBACK_URL`  | `https://your-api-url/auth/google/callback` |

### Step 3: Redis Setup

1. **Create Redis Instance**
   - Render Dashboard → New → Redis
   - Name: `param-adventures-redis`
   - Region: Same as backend
   - Plan: Free or Starter

2. **Get Redis URL**
   - Copy "Internal Redis URL"
   - Add to backend `REDIS_URL` variable

3. **Redis Usage**
   Redis is used for:
   - Session storage
   - Rate limiting
   - Caching (trip data, user sessions)
   - Job queue backing (BullMQ)

### Step 4: BullMQ Job Queue Setup

BullMQ handles background jobs for email delivery and payment processing.

#### Configuration

BullMQ automatically connects using `REDIS_URL` from environment variables.

**Queues:**

- `email-queue`: Handles all email notifications (booking confirmations, password resets, etc.)
- `payment-queue`: Processes payment webhooks and refund operations

#### Worker Configuration

Workers start automatically with the backend service. Configure in `apps/api/src/workers/`:

```typescript
// apps/api/src/workers/email.worker.ts
import { Worker } from "bullmq";

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    // Process email job
    await sendEmail(job.data);
  },
  {
    connection: { url: process.env.REDIS_URL },
    concurrency: 5, // Process 5 emails concurrently
  }
);
```

#### Monitoring Jobs

**Via Code:**

```typescript
import { Queue } from "bullmq";

const emailQueue = new Queue("email-queue", {
  connection: { url: process.env.REDIS_URL },
});

// Check job counts
const waiting = await emailQueue.getWaitingCount();
const active = await emailQueue.getActiveCount();
const failed = await emailQueue.getFailedCount();
```

**Via Redis CLI:**

```bash
redis-cli -u $REDIS_URL
> KEYS bull:email-queue:*
> LLEN bull:email-queue:wait
> LLEN bull:email-queue:active
> LLEN bull:email-queue:failed
```

#### Scaling Workers

For high-volume production:

1. **Increase Concurrency**

   ```typescript
   new Worker("email-queue", handler, {
     concurrency: 10, // Process 10 jobs concurrently
   });
   ```

2. **Deploy Separate Worker Service** (Optional)
   - Create new Render Web Service for workers only
   - Set `START_COMMAND`: `node dist/workers/index.js`
   - Use same environment variables as main backend
   - Scale workers independently

### Step 5: Payment Webhook Configuration

#### Razorpay Webhook Setup

1. **Generate Webhook Secret**

   ```bash
   # Generate secure webhook secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to Environment Variables**

   ```
   RAZORPAY_WEBHOOK_SECRET=<generated-secret>
   ```

3. **Configure in Razorpay Dashboard**
   - Go to [Razorpay Settings → Webhooks](https://dashboard.razorpay.com/app/webhooks)
   - Click "Add New Webhook"
   - **Webhook URL**: `https://your-api-url/webhooks/razorpay`
   - **Secret**: Use the generated secret from step 1
   - **Active Events** (select these):
     - ✅ `payment.authorized`
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `order.paid`
     - ✅ `refund.created`
     - ✅ `refund.processed`
   - Click "Create Webhook"

4. **Test Webhook**

   ```bash
   # Use Razorpay webhook testing tool
   curl -X POST https://your-api-url/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "X-Razorpay-Signature: <test-signature>" \
     -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test123"}}}}'
   ```

5. **Verify in Logs**
   - Check Render logs for webhook events
   - Look for: `[WEBHOOK] Razorpay event: payment.captured`

#### Webhook Security

- ✅ Always verify HMAC signature
- ✅ Use HTTPS endpoints only
- ✅ Rotate webhook secret periodically
- ✅ Monitor failed webhook attempts
- ✅ Set up alerts for webhook failures

#### Webhook Retry Logic

Razorpay retries failed webhooks:

- **Retry Schedule**: 1min, 5min, 30min, 1hr, 6hr, 12hr, 24hr
- **Total Retries**: 7 attempts over 24 hours
- **Action Required**: If all retries fail, manually reconcile payment status

**Handling Retries**:

```typescript
// apps/api/src/controllers/webhooks/razorpay.controller.ts
export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];

  // Verify signature
  const isValid = verifyWebhookSignature(req.body, signature);
  if (!isValid) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { event, payload } = req.body;

  // Idempotency check (prevent duplicate processing)
  const processed = await redis.get(`webhook:${payload.payment.id}`);
  if (processed) {
    return res.status(200).json({ status: "already_processed" });
  }

  // Process event
  await processPaymentEvent(event, payload);

  // Mark as processed (TTL 7 days)
  await redis.set(`webhook:${payload.payment.id}`, "true", "EX", 604800);

  res.status(200).json({ status: "success" });
}
```

### Step 6: Email Queue Configuration

#### Email Service Setup

Email delivery is handled asynchronously via BullMQ jobs.

**Supported Providers:**

- Resend (recommended)
- Brevo (SendinBlue)
- SMTP (generic)

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for provider-specific setup.

#### Email Queue Jobs

**Job Types:**

- `booking-confirmation`: Sent after successful booking
- `payment-success`: Sent after payment capture
- `payment-failed`: Sent when payment fails
- `password-reset`: Password reset link
- `admin-notification`: New booking alerts to admin

**Adding Email to Queue:**

```typescript
import { emailQueue } from "../queues/email.queue";

// Send booking confirmation
await emailQueue.add("booking-confirmation", {
  to: user.email,
  bookingId: booking.id,
  tripTitle: trip.title,
  userName: user.name,
});
```

#### Email Templates

Templates are stored in `apps/api/src/templates/email/`:

- `booking-confirmation.html`
- `payment-success.html`
- `password-reset.html`

**Using Templates:**

```typescript
import { renderEmailTemplate } from "../utils/email";

const html = renderEmailTemplate("booking-confirmation", {
  userName: "John Doe",
  tripTitle: "Himalayan Trek",
  bookingDate: "2026-02-15",
  totalAmount: "₹15,000",
});
```

#### Email Retry Configuration

```typescript
// apps/api/src/queues/email.queue.ts
import { Queue } from "bullmq";

export const emailQueue = new Queue("email-queue", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: "exponential", // Exponential backoff
      delay: 5000, // Start with 5s delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 1000, // Keep last 1000 failed jobs
  },
});
```

#### Monitoring Email Delivery

**Check Queue Status:**

```bash
cd apps/api
node -e "
const { Queue } = require('bullmq');
const queue = new Queue('email-queue', { connection: { url: process.env.REDIS_URL } });
queue.getJobCounts().then(counts => console.log(counts));
"
```

**Monitor Failed Jobs:**

```typescript
// Get failed jobs
const failedJobs = await emailQueue.getFailed(0, 10);

// Retry failed job
await failedJobs[0].retry();

// Or retry all failed
const allFailed = await emailQueue.getFailed();
await Promise.all(allFailed.map((job) => job.retry()));
```

#### Email Rate Limiting

To avoid SMTP rate limits:

```typescript
// apps/api/src/queues/email.queue.ts
export const emailQueue = new Queue("email-queue", {
  connection: { url: process.env.REDIS_URL },
  limiter: {
    max: 100, // Max 100 emails
    duration: 3600, // Per hour (3600 seconds)
  },
});
```

**Provider Limits:**

- **Resend**: 100 emails/day (free), 50,000/month (paid)
- **Brevo**: 300 emails/day (free), unlimited (paid)
- **Generic SMTP**: Check with your provider

### Step 7: Deploy

- Click "Create Web Service"
- Wait for build to complete (5-10 minutes first time)
- Check logs for:
  - ✅ Prisma connection established
  - ✅ Redis connection established
  - ✅ Email worker started
  - ✅ Payment worker started
- Health check endpoint: `https://your-api-url/health`
- Test webhook: `https://your-api-url/webhooks/razorpay`

---

## Frontend Deployment (Vercel)

### Step 1: Import Project

1. **New Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import Git Repository
   - Select your GitHub repo

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: npm install && npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### Step 2: Environment Variables

Add variables from `apps/web/.env.example`:

| Variable                            | Example Value                               |
| ----------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | `https://param-adventures-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL`              | `https://paramadventures.com`               |
| `NEXT_PUBLIC_SITE_NAME`             | `Param Adventures`                          |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`       | `rzp_live_xxxxx`                            |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name`                           |
| `NEXT_PUBLIC_SENTRY_DSN`            | `https://xxx@sentry.io/xxx`                 |
| `NODE_ENV`                          | `production`                                |

### Step 3: Deploy

- Click "Deploy"
- First deployment takes ~3-5 minutes
- Vercel auto-generates preview URL: `https://param-adventures-xxx.vercel.app`

### Step 4: Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `paramadventures.com`)

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or A record pointing to Vercel's IP

3. **SSL Certificate**
   - Vercel automatically provisions SSL (Let's Encrypt)
   - Usually ready in < 5 minutes

---

## Database Migrations

### Understanding Prisma Migrations

Prisma manages database schema via migrations stored in `apps/api/prisma/migrations/`.

### Development vs Production

**Development:**

```bash
# Create new migration after schema changes
npx prisma migrate dev --name add_new_field

# This:
# 1. Creates SQL migration file
# 2. Applies migration to dev DB
# 3. Regenerates Prisma Client
```

**Production:**

```bash
# Deploy pending migrations (no creation)
npx prisma migrate deploy

# This:
# 1. Applies all pending migrations
# 2. Does NOT create new migrations
# 3. Safe for production
```

### Migration Workflow for Production

#### Before Deploying Schema Changes:

1. **Create Migration Locally**

   ```bash
   cd apps/api
   npx prisma migrate dev --name descriptive_name
   ```

2. **Test Migration**

   ```bash
   # Reset and re-apply
   npx prisma migrate reset
   npx prisma migrate dev

   # Run tests
   npm test
   ```

3. **Commit Migration Files**
   ```bash
   git add apps/api/prisma/migrations/
   git commit -m "feat: add new field to User model"
   git push
   ```

#### Deploying to Production:

1. **Backup Database First** (see Backup section below)

2. **Apply Migrations**

   **Method 1: Automatic (Render build script)**
   Add to `package.json`:

   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && tsc"
     }
   }
   ```

   **Method 2: Manual (SSH or Render Shell)**

   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

3. **Verify Migration**

   ```bash
   npx prisma migrate status
   ```

4. **Test Application**
   - Check health endpoint
   - Test affected features
   - Monitor Sentry for errors

### Rollback Procedure

If migration fails:

1. **Restore from Backup**

   ```bash
   psql $DATABASE_URL < backup.sql
   ```

2. **Revert Code**

   ```bash
   git revert HEAD
   git push
   ```

3. **Redeploy** previous working version

### Migration Best Practices

- ✅ Always backup before migrations
- ✅ Test migrations in staging environment first
- ✅ Use descriptive migration names
- ✅ Review generated SQL before deploying
- ✅ Deploy during low-traffic windows
- ❌ Never edit migration files manually
- ❌ Don't skip migrations (apply in order)
- ❌ Avoid breaking changes without transition period

---

## Backup & Restore Procedures

### Automated Backups (Render PostgreSQL)

Render automatically backs up your database:

- **Free Plan**: No automated backups (manual only)
- **Starter Plan**: Daily backups, 7-day retention
- **Pro Plan**: Daily backups, 30-day retention

### Manual Backup

#### 1. Using Render Dashboard

- Go to your database → Backups tab
- Click "Create Backup"
- Download when complete

#### 2. Using pg_dump (Recommended)

```bash
# Get DATABASE_URL from Render dashboard

# Backup entire database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup schema only
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Backup data only
pg_dump $DATABASE_URL --data-only > data_backup.sql

# Backup specific tables
pg_dump $DATABASE_URL -t users -t trips > partial_backup.sql
```

#### 3. Automated Backup Script

Create `apps/api/scripts/backup-db.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/param_adventures_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup..."
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE
echo "✅ Backup completed: $BACKUP_FILE.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Run daily via cron:

```bash
# Add to crontab
0 2 * * * cd /path/to/app && ./apps/api/scripts/backup-db.sh
```

### Restore Procedures

#### From Manual Backup:

```bash
# Restore entire database
psql $DATABASE_URL < backup.sql

# Restore specific table
psql $DATABASE_URL -c "TRUNCATE users CASCADE;"
psql $DATABASE_URL < users_backup.sql
```

#### From Render Backup:

1. Download backup from Render dashboard
2. Unzip if compressed
3. Run restore command above

#### Emergency Restore:

```bash
# 1. Drop all connections
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'your_db_name';"

# 2. Drop and recreate database
psql $DATABASE_URL -c "DROP DATABASE IF EXISTS your_db_name;"
psql $DATABASE_URL -c "CREATE DATABASE your_db_name;"

# 3. Restore from backup
psql $DATABASE_URL < backup.sql

# 4. Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

---

## Post-Deployment Checklist

After deploying both frontend and backend:

### Smoke Tests:

- [ ] **Health Check**: Visit `https://your-api-url/health` → Should return 200 OK
- [ ] **Frontend Loads**: Visit `https://your-frontend-url` → Homepage loads
- [ ] **API Connection**: Check browser console for API errors
- [ ] **Database**: Backend logs show successful Prisma connection
- [ ] **Redis**: No Redis connection errors in logs
- [ ] **Job Queues**: Email worker and payment worker started successfully

### Automated Verification 🚀

We provide a script to automatically verify the health of the deployment:

```bash
# Set your production URL
export PRODUCTION_API_URL="https://your-api-url.onrender.com"

# Run the verification script
npx ts-node scripts/verify-prod.ts
```

This script will check:

1. API Health (`/health`)
2. Trip accessibility (`/api/v1/trips`)
3. Documentation availability (`/api-docs/`)

If any check fails, investigate the backend logs immediately.

### Service Health Checks:

- [ ] **Redis Connection**:
  ```bash
  redis-cli -u $REDIS_URL ping
  # Should return: PONG
  ```
- [ ] **BullMQ Workers**:
  - Check logs for: `[WORKER] Email worker started`
  - Check logs for: `[WORKER] Payment worker started`
- [ ] **Webhook Endpoint**:

  ```bash
  curl https://your-api-url/webhooks/razorpay
  # Should return 405 (Method Not Allowed) for GET
  ```

- [ ] **Email Queue**:
  ```bash
  # Check queue status
  node -e "const {Queue}=require('bullmq');const q=new Queue('email-queue',{connection:{url:process.env.REDIS_URL}});q.getJobCounts().then(console.log)"
  ```

### Authentication Tests:

- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are issued
- [ ] Refresh token flow works
- [ ] Google OAuth works (if enabled)
- [ ] Password reset email sent and delivered

### Core Features:

- [ ] Browse trips (public pages load)
- [ ] View trip details
- [ ] Book a trip (payment integration)
- [ ] User dashboard loads
- [ ] Admin dashboard accessible (for admin users)

### Admin Tests:

- [ ] Create new trip
- [ ] Upload images (Cloudinary)
- [ ] Approve booking
- [ ] View analytics

### Email Tests:

- [ ] Welcome email sent on registration
- [ ] Password reset email works
- [ ] Booking confirmation sent

### Monitoring:

- [ ] Sentry receiving events
- [ ] Error tracking functional
- [ ] Performance metrics visible
- [ ] Set up alerts (see Monitoring section)

### Security:

- [ ] HTTPS enforced (no mixed content warnings)
- [ ] CORS configured correctly (no CORS errors)
- [ ] Rate limiting active
- [ ] Auth middleware protecting routes
- [ ] Environment variables not exposed

---

## Monitoring & Alerts

### Sentry Setup

1. **Backend Errors**
   - Go to Sentry project → Settings → Alerts
   - Create alert rule: "Any error occurs"
   - Notify: Email + Slack (if integrated)

2. **Frontend Errors**
   - Same setup for frontend project
   - Filter by severity: Error or Fatal

3. **Performance Monitoring**
   - Enable Transaction Tracing
   - Set sample rate: 0.1 (10%)

### Uptime Monitoring

Use a free service like:

- [UptimeRobot](https://uptimerobot.com) (50 monitors free)
- [Better Uptime](https://betteruptime.com) (10 monitors free)
- [Checkly](https://www.checklyhq.com) (10 checks free)

**Configure monitors for:**

- `/health` endpoint (every 5 minutes)
- Frontend homepage (every 5 minutes)
- API critical endpoints (every 10 minutes)

### Log Monitoring (Render)

- View real-time logs: Render Dashboard → Your Service → Logs
- Download logs for analysis
- Set up log drains (Pro plan only)

### Performance Monitoring

**Backend (Node.js):**

```javascript
// Add to server.ts
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(
        `Slow request: ${req.method} ${req.path} took ${duration}ms`
      );
    }
  });
  next();
});
```

**Frontend (Vercel Analytics):**

- Automatically enabled on Vercel
- View: Vercel Dashboard → Analytics
- Metrics: Web Vitals, Page Load Time

---

## Rollback Procedures

If deployment fails or introduces critical bugs:

### Quick Rollback (Vercel)

1. Go to Deployments tab
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Rollback complete in ~30 seconds

### Rollback Backend (Render)

**Method 1: Redeploy Previous Commit**

```bash
# Locally
git log --oneline -10
git revert <bad-commit-hash>
git push

# Render auto-redeploys
```

**Method 2: Manual Deploy**

- Render Dashboard → Manual Deploy
- Select previous commit from dropdown
- Click "Deploy"

### Database Rollback

If migration caused issues:

1. **Restore from backup** (see Backup section)
2. **Revert migration** (if possible):
   ```bash
   # Mark migration as not applied
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

### Full System Rollback

1. Rollback frontend (Vercel)
2. Rollback backend (Render)
3. Restore database (if needed)
4. Verify all systems operational
5. Post-incident review

---

## Troubleshooting

### Common Issues:

#### 1. **500 Error on Upload**

**Cause**: Missing Cloudinary credentials
**Fix**:

- Check Render environment variables
- Verify `CLOUDINARY_API_SECRET` is set correctly
- Test with Cloudinary dashboard

#### 2. **CORS Error**

**Symptom**: `Access-Control-Allow-Origin` error in browser console
**Fix**:

- Ensure `FRONTEND_URL` in backend matches Vercel domain exactly
- Check `CORS_ORIGIN` includes all necessary domains
- Verify no trailing slashes in URLs

#### 3. **Database Connection Failed**

**Symptom**: `P1001: Can't reach database server`
**Fix**:

- Verify `DATABASE_URL` is correct
- Check database is running (Render dashboard)
- Ensure IP allowlist includes Render IPs (if using external DB)

#### 4. **Build Failed**

**Symptom**: Deployment fails during build
**Fix**:

- Check build logs for specific error
- Ensure all dependencies in `package.json`
- Verify Node version compatibility
- Clear build cache (Render: Settings → Clear build cache)

#### 5. **Redis Connection Error**

**Symptom**: `Error: connect ECONNREFUSED`
**Fix**:

- Check `REDIS_URL` is correct
- Verify Redis instance is running
- Test connection manually: `redis-cli -u $REDIS_URL ping`

#### 6. **Email Not Sending**

**Symptom**: No emails received, no errors in logs
**Fix**:

- Verify SMTP credentials
- Check email provider dashboard for delivery status
- Test with Ethereal (see [EMAIL_SETUP.md](EMAIL_SETUP.md))
- Review firewall rules (some networks block SMTP)
- Check email queue status:
  ```bash
  node -e "const {Queue}=require('bullmq');const q=new Queue('email-queue',{connection:{url:process.env.REDIS_URL}});q.getJobCounts().then(console.log)"
  ```
- Check worker logs for errors: `[WORKER] Email worker error`

#### 7. **Payment Gateway Error**

**Symptom**: Razorpay checkout fails
**Fix**:

- Verify Razorpay keys (test vs live)
- Check webhook URL is accessible
- Review Razorpay dashboard for failed payments
- Ensure HTTPS is enabled (required for payments)

#### 8. **JWT Token Invalid**

**Symptom**: Users logged out unexpectedly
**Fix**:

- Check `JWT_ACCESS_SECRET` hasn't changed
- Verify token expiry times
- Clear cookies and login again
- Check for clock skew on server

#### 9. **BullMQ Job Stuck**

**Symptom**: Jobs not processing, queue backed up
**Fix**:

- Check worker logs for errors
- Verify Redis connection
- Check job status:
  ```bash
  redis-cli -u $REDIS_URL
  > LLEN bull:email-queue:wait
  > LLEN bull:email-queue:active
  > LLEN bull:email-queue:failed
  ```
- Manually retry failed jobs:
  ```typescript
  const { Queue } = require("bullmq");
  const queue = new Queue("email-queue", {
    connection: { url: process.env.REDIS_URL },
  });
  const failed = await queue.getFailed();
  await Promise.all(failed.map((job) => job.retry()));
  ```
- Restart worker: Redeploy backend service

#### 10. **Webhook Not Receiving Events**

**Symptom**: Razorpay webhooks not triggering, payments not updating
**Fix**:

- Verify webhook URL in Razorpay dashboard
- Check webhook secret: `RAZORPAY_WEBHOOK_SECRET`
- Test webhook manually:
  ```bash
  curl -X POST https://your-api-url/webhooks/razorpay \
    -H "Content-Type: application/json" \
    -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test"}}}}'
  ```
- Check Render logs for webhook requests
- Verify signature verification logic
- Check Razorpay webhook delivery logs (Settings → Webhooks → Logs)

#### 11. **Queue Memory Overflow**

**Symptom**: Redis memory usage high, jobs getting lost
**Fix**:

- Increase Redis memory limit (upgrade plan)
- Configure job retention:
  ```typescript
  const queue = new Queue("email-queue", {
    defaultJobOptions: {
      removeOnComplete: 100, // Keep only last 100 completed
      removeOnFail: 500, // Keep only last 500 failed
    },
  });
  ```
- Clean up old jobs:
  ```typescript
  await queue.clean(86400000, 1000, "completed"); // Remove completed jobs older than 1 day
  await queue.clean(604800000, 1000, "failed"); // Remove failed jobs older than 7 days
  ```

### Debug Mode

Enable verbose logging temporarily:

**Backend** (`apps/api/src/app.ts`):

```typescript
if (process.env.DEBUG_MODE === "true") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

Add `DEBUG_MODE=true` to Render environment variables, then remove after debugging.

### Getting Help

1. **Check logs first**: Render logs + Browser console
2. **Review Sentry**: Recent errors might give clues
3. **Test locally**: Can you reproduce the issue?
4. **Check status pages**:
   - [Render Status](https://status.render.com)
   - [Vercel Status](https://www.vercel-status.com)
   - [Cloudinary Status](https://status.cloudinary.com)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)

---

## 🆘 Emergency Contacts

- **Render Support**: support@render.com
- **Vercel Support**: vercel.com/support
- **Cloudinary Support**: support@cloudinary.com
- **Razorpay Support**: support@razorpay.com

**Internal:**

- DevOps Lead: admin@paramadventures.com
- Backend Lead: admin@paramadventures.com
- Frontend Lead: admin@paramadventures.com
