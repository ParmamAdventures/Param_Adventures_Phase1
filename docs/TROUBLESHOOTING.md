# Troubleshooting Guide - Param Adventures

Solutions for common issues and problems.

---

## 📋 Quick Reference

| Issue                   | Cause                  | Solution                          |
| ----------------------- | ---------------------- | --------------------------------- |
| Tests failing           | Database migration     | Run `npx prisma migrate deploy`   |
| API not responding      | Port already in use    | Change PORT env or kill process   |
| Frontend can't connect  | API URL wrong          | Check `NEXT_PUBLIC_API_URL`       |
| Payment errors          | Webhook not configured | Setup Razorpay webhook            |
| Email not sending       | SMTP config wrong      | Verify email provider credentials |
| Database slow           | Missing indexes        | Run `npx prisma db push`          |
| Redis connection failed | Redis not running      | `docker-compose up -d`            |

---

## 🔧 Common Issues

### Development Environment

#### "Port 3001 already in use"

```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port
PORT=3002 npm run dev
```

#### "Cannot find module '@prisma/client'"

```bash
# Regenerate Prisma client
npx prisma generate

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

#### "ENOENT: no such file or directory, open '.env.local'"

```bash
# Create environment files
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# Edit with your values
nano apps/api/.env.local
```

### Database Issues

#### "Database connection refused"

```bash
# Check if PostgreSQL is running
docker-compose ps

# Start if not running
docker-compose up -d

# Verify connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### "Unique constraint violation"

```
ERROR: duplicate key value violates unique constraint "User_email_key"
```

**Solutions**:

1. Check if email already exists: `select * from "User" where email = 'test@example.com';`
2. Delete duplicate record: `delete from "User" where email = 'test@example.com';`
3. Reset database: `npx prisma migrate reset`

#### "Migration pending"

```
Error: Migration(s) pending
```

**Solution**:

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

#### "Database locked"

```bash
# In rare cases, reset connection pool
npx prisma db execute --stdin < /dev/null

# Or restart database
docker-compose restart postgres
```

### Testing Issues

#### "Tests timeout"

```bash
# Increase timeout
npm test -- --testTimeout=30000

# Or enable debug
DEBUG=* npm test
```

#### "Cannot find test database"

```bash
# Ensure TEST_DATABASE_URL is set
echo $DATABASE_URL

# Create test database
createdb param_adventures_test

# Run migrations
DATABASE_URL=postgresql://... npx prisma migrate deploy
```

#### "Tests pass locally but fail in CI"

**Common causes**:

1. Environment variables not set
2. Database not initialized
3. Port conflicts

**Solution**:

```bash
# Ensure all env vars are set in CI
# Add setup step to CI config
npx prisma migrate deploy
npm test
```

### API Issues

#### "API returning 404 for all endpoints"

```bash
# Check if API is running
curl http://localhost:3001/health

# If not, check logs
npm run dev 2>&1 | head -50
```

#### "CORS errors in browser"

```
Access to XMLHttpRequest at 'http://localhost:3001' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution** - Check `CORS_ORIGIN` in `.env`:

```env
CORS_ORIGIN=http://localhost:3000
# or for production
CORS_ORIGIN=https://yourapp.com
```

#### "401 Unauthorized on protected routes"

**Causes**:

1. No token provided
2. Token expired
3. Token invalid

**Solution**:

```bash
# 1. Get new token (login)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# 2. Use token in request
curl http://localhost:3001/trips \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### "403 Forbidden - Permission denied"

**Cause**: User doesn't have required permission

**Solution**:

```bash
# Check user roles/permissions
select * from "User" where email = 'admin@test.com';
select * from "UserRole" where "userId" = 'user-id';
select * from "Role" where id = 'role-id';

# Add permission to role if needed
```

### Payment Issues

#### "Razorpay signature verification failed"

```
Error: Invalid payment signature
```

**Causes**:

1. RAZORPAY_WEBHOOK_SECRET wrong
2. Webhook payload modified
3. Development vs production keys mixed

**Solution**:

```bash
# Verify webhook secret
echo $RAZORPAY_WEBHOOK_SECRET

# Get correct secret from Razorpay dashboard
# Settings → Webhooks → Copy Secret

# Update .env and restart API
```

#### "Payment webhook not received"

**Check**:

1. Webhook URL is public HTTPS
2. Webhook enabled in Razorpay dashboard
3. Razorpay account has permissions
4. Network firewall allows inbound requests

**Test webhook**:

```bash
curl -X POST http://localhost:3001/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test"}}}}'
```

#### "Payment amount mismatch"

```
Error: Amount mismatch
```

**Cause**: Razorpay amount in paise, not rupees

**Solution**: Always convert to paise (multiply by 100)

```javascript
const amount = 1000; // ₹1000
const amountInPaise = amount * 100; // 100000 paise
```

### Email Issues

#### "Emails not sending"

**Check**:

1. SMTP credentials correct
2. Email provider account active
3. Sender email verified
4. Rate limits not exceeded

**Test email send**:

```bash
npm run send-test-email
```

#### "Bounce/delivery failures"

**Solution**:

1. Check email provider dashboard for bounce details
2. Verify sender email is verified
3. Check spam folder for test emails
4. Review email content for spam triggers

#### "Timeout sending email"

```bash
# Increase timeout in apps/api/.env
EMAIL_TIMEOUT=30000 npm run dev
```

### Redis/Queue Issues

#### "Redis connection refused"

```bash
# Start Redis
docker-compose up -d redis

# Verify connection
redis-cli -u $REDIS_URL ping
```

#### "Jobs stuck in queue"

```bash
# Check queue status
node -e "
const {Queue} = require('bullmq');
const q = new Queue('email-queue', {connection: {url: process.env.REDIS_URL}});
q.getJobCounts().then(console.log);
"

# Retry failed jobs
node -e "
const {Queue} = require('bullmq');
const q = new Queue('email-queue', {connection: {url: process.env.REDIS_URL}});
q.getFailed().then(jobs => Promise.all(jobs.map(j => j.retry())));
"

# Clear queue
node -e "
const {Queue} = require('bullmq');
const q = new Queue('email-queue', {connection: {url: process.env.REDIS_URL}});
q.clean(0, 100000, 'failed');
"
```

#### "Memory usage high"

**Solution**:

```bash
# In apps/api/.env, add job retention limits
# Then restart worker

# Or manually prune old jobs
redis-cli -u $REDIS_URL KEYS "bull:*" | head -20
```

### Frontend Issues

#### "Blank page on load"

**Check**:

1. Browser console for errors
2. Network tab for API failures
3. `NEXT_PUBLIC_API_URL` correct

**Solution**:

```bash
# Clear cache
rm -rf .next
npm run dev
```

#### "Styles not loading"

```bash
# Rebuild Tailwind
npx tailwindcss -i ./src/input.css -o ./dist/output.css

# Or in dev mode
npm run dev
```

#### "Images not loading"

**Check**:

1. Image URL is valid
2. Cloudinary URL format correct
3. CORS headers on CDN

**Solution**:

```javascript
// Use next/image for optimization
import Image from "next/image";

<Image
  src="https://res.cloudinary.com/..."
  alt="description"
  width={300}
  height={200}
/>;
```

---

## 🔍 Debugging Techniques

### Enable Debug Logging

```bash
# Node.js debug
DEBUG=* npm run dev

# Specific module
DEBUG=app:* npm run dev

# Express routes
DEBUG=express:* npm run dev
```

### Database Debugging

```bash
# Open Prisma Studio
npx prisma studio

# Then view/edit data in browser
# Open http://localhost:5555
```

### Network Debugging

```bash
# Log all HTTP requests
npm install --save-dev morgan

# Add to apps/api/src/app.ts
import morgan from 'morgan';
app.use(morgan('dev'));
```

### Performance Profiling

```bash
# Node.js built-in profiler
node --prof apps/api/dist/app.js

# Process profile
node --prof-process isolate-*.log > profile.txt
cat profile.txt
```

---

## 📋 Health Checks

Run these to verify system health:

```bash
# 1. API health
curl http://localhost:3001/health

# 2. Database
psql $DATABASE_URL -c "SELECT 1;"

# 3. Redis
redis-cli -u $REDIS_URL ping

# 4. Frontend
curl http://localhost:3000

# 5. Test suite
cd apps/api && npm test -- --passWithNoTests

# 6. Lint
npm run lint
```

---

## 🚨 Emergency Recovery

### Full Reset

```bash
# Stop everything
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Reinitialize
cd apps/api
npx prisma migrate deploy
npm run seed

# Start dev
npm run dev
```

### Database Backup Before Major Changes

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql $DATABASE_URL < backup_20260117_120000.sql
```

### Git Recovery

```bash
# Undo last commit (local only)
git reset --soft HEAD~1

# Undo unpushed commits
git reset --hard origin/main

# Recover deleted file
git checkout HEAD^ -- deleted_file.ts
```

---

## 📚 Additional Resources

- [README.md](../README.md) - Project overview
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Developer cheat sheet
- [API_ERROR_CODES.md](./API_ERROR_CODES.md) - API errors
- [Prisma Troubleshooting](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Docker Issues](https://docs.docker.com/config/containers/troubleshoot/)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
