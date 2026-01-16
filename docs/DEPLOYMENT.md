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

## 🏗️ Architecture Overview

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

## ✅ Prerequisites

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

## 🗄️ Database Setup

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

## 🖥️ Backend Deployment (Render.com)

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

| Variable                 | Example Value                               | Where to Get                                                                         |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`           | `postgresql://user:pass@host/db`            | Render PostgreSQL dashboard                                                          |
| `NODE_ENV`               | `production`                                | -                                                                                    |
| `PORT`                   | `3001`                                      | -                                                                                    |
| `API_URL`                | `https://param-adventures-api.onrender.com` | Your Render URL                                                                      |
| `FRONTEND_URL`           | `https://paramadventures.com`               | Your Vercel domain                                                                   |
| `CORS_ORIGIN`            | `https://paramadventures.com`               | Same as frontend                                                                     |
| `JWT_ACCESS_SECRET`      | `[64-char random string]`                   | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET`     | `[64-char random string]`                   | Generate same way                                                                    |
| `JWT_ACCESS_EXPIRES_IN`  | `15m`                                       | -                                                                                    |
| `JWT_REFRESH_EXPIRES_IN` | `7d`                                        | -                                                                                    |
| `REDIS_URL`              | `redis://default:pass@host:6379`            | See Redis setup below                                                                |
| `CLOUDINARY_CLOUD_NAME`  | `your-cloud-name`                           | [Cloudinary Console](https://cloudinary.com/console)                                 |
| `CLOUDINARY_API_KEY`     | `123456789012345`                           | Cloudinary Console                                                                   |
| `CLOUDINARY_API_SECRET`  | `abcdef123456`                              | Cloudinary Console                                                                   |
| `RAZORPAY_KEY_ID`        | `rzp_live_xxxxx`                            | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)                        |
| `RAZORPAY_KEY_SECRET`    | `xxxxx`                                     | Razorpay Dashboard                                                                   |
| `SMTP_HOST`              | `smtp.resend.com`                           | See [EMAIL_SETUP.md](EMAIL_SETUP.md)                                                 |
| `SMTP_PORT`              | `465`                                       | -                                                                                    |
| `SMTP_SECURE`            | `true`                                      | -                                                                                    |
| `SMTP_USER`              | `resend`                                    | Email provider                                                                       |
| `SMTP_PASS`              | `re_xxxxx`                                  | Email provider API key                                                               |
| `SMTP_FROM`              | `noreply@paramadventures.com`               | Your verified domain                                                                 |
| `SENTRY_DSN`             | `https://xxx@sentry.io/xxx`                 | [Sentry Projects](https://sentry.io/settings/projects/)                              |
| `SENTRY_ENVIRONMENT`     | `production`                                | -                                                                                    |
| `SESSION_SECRET`         | `[32-char random string]`                   | Generate same way as JWT                                                             |
| `ENABLE_SWAGGER`         | `true`                                      | -                                                                                    |
| `ENABLE_AUDIT_LOGGING`   | `true`                                      | -                                                                                    |
| `ENABLE_SOCKET_IO`       | `true`                                      | -                                                                                    |

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

### Step 4: Deploy

- Click "Create Web Service"
- Wait for build to complete (5-10 minutes first time)
- Check logs for any errors
- Health check endpoint: `https://your-api-url/health`

---

## 🌐 Frontend Deployment (Vercel)

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

## 🔄 Database Migrations

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

## 💾 Backup & Restore Procedures

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

## ✅ Post-Deployment Checklist

After deploying both frontend and backend:

### Smoke Tests:

- [ ] **Health Check**: Visit `https://your-api-url/health` → Should return 200 OK
- [ ] **Frontend Loads**: Visit `https://your-frontend-url` → Homepage loads
- [ ] **API Connection**: Check browser console for API errors
- [ ] **Database**: Backend logs show successful Prisma connection
- [ ] **Redis**: No Redis connection errors in logs

### Authentication Tests:

- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are issued
- [ ] Refresh token flow works
- [ ] Google OAuth works (if enabled)
- [ ] Password reset email sent

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

## 📊 Monitoring & Alerts

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

## 🔙 Rollback Procedures

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

## 🔧 Troubleshooting

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

- DevOps Lead: [Your contact]
- Backend Lead: [Your contact]
- Frontend Lead: [Your contact]
