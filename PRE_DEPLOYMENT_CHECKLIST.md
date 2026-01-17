# Pre-Production Deployment Checklist

**Date**: January 17, 2026  
**Project**: Param Adventures Phase 1  
**Status**: Ready for Local Testing

---

## 📋 Pre-Deployment Verification Checklist

### ✅ Code Quality & Testing

- [x] **ESLint**: 0 errors, 252 warnings (acceptable)
- [x] **TypeScript**: No compilation errors
- [x] **Tests**: 350/350 passing (100%)
  - 31/31 test suites passing
  - All critical paths covered
- [x] **Git**: All changes committed
- [x] **Documentation**: 15 guides complete

### ✅ Backend (API)

- [ ] **Environment Setup**
  - [ ] `.env.local` created with all required variables
  - [ ] Database credentials configured
  - [ ] Redis connection validated
  - [ ] JWT secrets set (change before production)
  - [ ] Email provider configured (Mailtrap for dev)
  - [ ] Razorpay test keys added

- [ ] **Database**
  - [ ] Docker PostgreSQL running (port 5433)
  - [ ] Migrations applied: `npx prisma migrate deploy`
  - [ ] Database schema verified
  - [ ] Indexes created
  - [ ] Dummy data seeded: `npm run seed:dummy`

- [ ] **Redis**
  - [ ] Docker Redis running (port 6379)
  - [ ] Connection verified
  - [ ] BullMQ job queue functional

- [ ] **API Server**
  - [ ] `npm install` completed
  - [ ] `npm run build` succeeds
  - [ ] `npm run dev` starts without errors
  - [ ] Health check endpoint responds: `curl http://localhost:3001/health`
  - [ ] API documentation available: `http://localhost:3001/api-docs`

- [ ] **Email Notifications**
  - [ ] SMTP configured (Mailtrap or console)
  - [ ] Queue jobs enqueue successfully
  - [ ] Test email can be sent

- [ ] **Payment Integration**
  - [ ] Razorpay test keys configured
  - [ ] Webhook simulation working
  - [ ] Payment endpoints accessible
  - [ ] Signature verification working

### ✅ Frontend (Web)

- [ ] **Environment Setup**
  - [ ] `.env.local` created
  - [ ] API URL points to `http://localhost:3001`
  - [ ] All required environment variables set

- [ ] **Build & Dependencies**
  - [ ] `npm install` completed
  - [ ] `npm run build` succeeds
  - [ ] No build warnings (non-critical)

- [ ] **Development Server**
  - [ ] `npm run dev` starts successfully
  - [ ] Pages load at `http://localhost:3000`
  - [ ] No console errors on load

- [ ] **Frontend Features**
  - [ ] Landing page displays correctly
  - [ ] Trip listing works
  - [ ] Trip detail pages load
  - [ ] Navigation functions properly
  - [ ] Responsive design verified (desktop, tablet, mobile)

### ✅ Integration Testing

- [ ] **Authentication Flow**
  - [ ] User can register
  - [ ] User can login
  - [ ] JWT token generated
  - [ ] Protected routes require auth
  - [ ] Logout clears session

- [ ] **Trip Features**
  - [ ] List trips from database
  - [ ] Filter trips by category
  - [ ] View trip details
  - [ ] View trip reviews
  - [ ] Sort trips by price/popularity

- [ ] **Booking Flow**
  - [ ] Create booking
  - [ ] Update booking details
  - [ ] View booking history
  - [ ] Cancel booking

- [ ] **Payment Flow**
  - [ ] Initiate payment (Razorpay order created)
  - [ ] Verify payment signature
  - [ ] Payment status updates booking
  - [ ] Confirmation email sent
  - [ ] Refund processing works

- [ ] **Admin Features**
  - [ ] Admin dashboard loads
  - [ ] Analytics/reports display correctly
  - [ ] User management functional
  - [ ] Trip management accessible
  - [ ] Booking approval/rejection works

### ✅ Database & Data

- [ ] **Dummy Data**
  - [ ] 4 test users created
  - [ ] 3 test trips available
  - [ ] 2 test bookings in system
  - [ ] Payment records exist
  - [ ] Reviews are seeded

- [ ] **Data Integrity**
  - [ ] Foreign keys validated
  - [ ] Cascading deletes tested
  - [ ] Unique constraints enforced
  - [ ] Default values applied correctly

- [ ] **Database Backup**
  - [ ] Backup location identified
  - [ ] Backup strategy documented
  - [ ] Restore process tested

### ✅ Performance & Monitoring

- [ ] **Performance**
  - [ ] API response times < 200ms
  - [ ] Database queries optimized
  - [ ] Frontend load time < 2s
  - [ ] No N+1 query problems

- [ ] **Logging**
  - [ ] Request logging enabled
  - [ ] Error logging configured
  - [ ] Log output location identified
  - [ ] Log rotation setup (if applicable)

- [ ] **Monitoring**
  - [ ] Health check endpoints working
  - [ ] Error tracking setup (Sentry)
  - [ ] Analytics tracking ready
  - [ ] Performance monitoring configured

### ✅ Security

- [ ] **Secrets Management**
  - [ ] All secrets in `.env.local` (not committed)
  - [ ] Development secrets safe (test values)
  - [ ] Production secrets planned
  - [ ] Secret rotation schedule documented

- [ ] **Database Security**
  - [ ] Admin password strong
  - [ ] Unnecessary permissions removed
  - [ ] SSL enabled for production plan
  - [ ] Backups encrypted (for production)

- [ ] **API Security**
  - [ ] CORS properly configured
  - [ ] Rate limiting configured
  - [ ] Input validation active
  - [ ] SQL injection prevention verified

- [ ] **Frontend Security**
  - [ ] No sensitive data in localStorage without encryption
  - [ ] XSS protection in place
  - [ ] CSRF tokens (if applicable)
  - [ ] Secure headers configured

---

## 🚀 Local Deployment Steps

### 1. Start Infrastructure

```bash
# Start Docker containers (PostgreSQL + Redis)
docker-compose up -d

# Verify services are running
docker ps
```

### 2. Setup Backend

```bash
cd apps/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Seed dummy data
npm run seed:dummy

# Start API server
npm run dev
```

**Expected Output**: Server running on `http://localhost:3001`

### 3. Setup Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output**: Frontend running on `http://localhost:3000`

### 4. Verify Integration

```bash
# Test API health
curl http://localhost:3001/health

# Test database connection
curl http://localhost:3001/api/trips

# Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:3001/api-docs (if available)
```

---

## 📊 Test Credentials

Use these credentials to test the application:

### Admin Account

- **Email**: `admin@test.com`
- **Password**: `AdminPass123`
- **Role**: Admin (full access)

### Organizer Account

- **Email**: `organizer@test.com`
- **Password**: `UserPass123`
- **Role**: Organizer (trip management)

### Regular User Accounts

- **Email**: `user1@test.com` / **Password**: `UserPass123`
- **Email**: `user2@test.com` / **Password**: `UserPass123`
- **Role**: User (booking, reviews)

---

## 🔧 Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start containers
docker-compose up -d postgres redis

# Verify connection
psql postgresql://postgres:postgres@localhost:5433/param_adventures
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -p 6379 ping
# Expected: PONG
```

### Prisma Migration Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name migration_name
```

### Frontend Can't Connect to API

- Check `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Verify API is running: `curl http://localhost:3001/health`
- Check browser console for CORS errors
- Verify CORS configuration in API `.env.local`

### Dummy Data Not Seeded

```bash
# Check if script exists
ls apps/api/scripts/seed-dummy-data.ts

# Run seed script manually
cd apps/api
npx ts-node scripts/seed-dummy-data.ts

# Verify data in database
npx prisma studio
# Opens http://localhost:5555
```

---

## 📝 Post-Deployment Tasks

### Before Production

1. **Security Audit**
   - [ ] Security review completed
   - [ ] Penetration testing performed
   - [ ] SSL certificates obtained
   - [ ] WAF configured (if applicable)

2. **Performance Optimization**
   - [ ] Database indexes optimized
   - [ ] Caching strategy implemented
   - [ ] CDN configured
   - [ ] Load testing completed

3. **Production Configuration**
   - [ ] Production `.env` created securely
   - [ ] Database backup strategy setup
   - [ ] Monitoring & alerting configured
   - [ ] Incident response plan documented

4. **Deployment Infrastructure**
   - [ ] Server/hosting selected
   - [ ] CI/CD pipeline configured
   - [ ] Docker registry setup (private)
   - [ ] Kubernetes/orchestration (if needed)

5. **Documentation**
   - [ ] Operations manual written
   - [ ] Runbooks created
   - [ ] Incident response procedures documented
   - [ ] Team trained

### Production Deployment

1. **Pre-Flight**
   - [ ] Final code review
   - [ ] All tests passing
   - [ ] Documentation complete
   - [ ] Team ready

2. **Deployment**
   - [ ] Database migrations applied
   - [ ] API deployed
   - [ ] Frontend deployed
   - [ ] DNS configured

3. **Post-Deployment**
   - [ ] Health checks passing
   - [ ] Monitoring active
   - [ ] Team on-call ready
   - [ ] Incident response plan activated

---

## 📚 Additional Resources

- [Backend Guide](../docs/BACKEND_GUIDE.md)
- [Frontend Guide](../docs/FRONTEND_GUIDE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)
- [Security Best Practices](../docs/SECURITY_BEST_PRACTICES.md)

---

**Prepared by**: Development Team  
**Last Updated**: January 17, 2026  
**Version**: 1.0.0
