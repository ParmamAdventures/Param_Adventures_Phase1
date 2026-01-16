# Pre-Release Checklist - Param Adventures v1.0

Complete this checklist before deploying to production. Check off each item as you complete it.

**Release Date Target**: [Set your date]  
**Release Manager**: [Name]  
**Last Updated**: January 16, 2026

---

## 📋 Table of Contents

1. [Code Quality](#code-quality)
2. [Testing](#testing)
3. [Documentation](#documentation)
4. [Security](#security)
5. [Performance](#performance)
6. [Infrastructure](#infrastructure)
7. [Third-Party Services](#third-party-services)
8. [Database](#database)
9. [Deployment](#deployment)
10. [Post-Deployment](#post-deployment)

---

## 💻 Code Quality

### Codebase Audit

- [ ] All `console.log` debug statements removed from production code
- [ ] No hardcoded credentials or API keys in code
- [ ] All `TODO` comments addressed or documented
- [ ] No dead code (unused imports, functions, components)
- [ ] TypeScript errors resolved (`npm run build` succeeds)
- [ ] ESLint warnings reviewed and fixed (critical ones)
- [ ] No `any` types in critical sections (auth, payments)
- [ ] Code formatting consistent (run Prettier)
- [ ] Comments added for complex logic
- [ ] All deprecated packages updated

### Git & Version Control

- [ ] Latest code pushed to `main` branch
- [ ] All feature branches merged
- [ ] No merge conflicts
- [ ] `.gitignore` properly configured (no `.env` files)
- [ ] Git tags created for release (e.g., `v1.0.0`)
- [ ] CHANGELOG.md updated with v1.0 changes
- [ ] README.md reviewed and accurate

---

## 🧪 Testing

### Unit Tests

- [ ] All unit tests passing (`npm test` in `apps/api`)
- [ ] Test coverage > 70% for critical services (auth, booking, payment)
- [ ] New features have corresponding tests
- [ ] Mock data updated and relevant

### Integration Tests

- [ ] All integration tests passing
- [ ] User registration flow tested
- [ ] Login/logout flow tested
- [ ] Trip creation and publication tested
- [ ] Booking flow tested (end-to-end)
- [ ] Payment verification tested (with test keys)
- [ ] Email sending tested (via Ethereal or real SMTP)

### E2E Tests

- [ ] E2E tests passing (`npm run test:e2e` in `apps/web`)
- [ ] Booking flow works (guest user → login → book)
- [ ] Admin dashboard accessible
- [ ] Trip filtering and search works
- [ ] Mobile responsiveness tested

### Manual Testing

- [ ] **User Flows**:
  - [ ] Register new account
  - [ ] Login with existing account
  - [ ] Browse and search trips
  - [ ] View trip details
  - [ ] Add trip to wishlist
  - [ ] Book a trip (complete payment)
  - [ ] View "My Bookings"
  - [ ] Cancel a booking
  - [ ] Write a review
  - [ ] Update profile (avatar, bio)
  - [ ] Change password
  - [ ] Forgot password flow

- [ ] **Admin Flows**:
  - [ ] Login as admin
  - [ ] Create new trip
  - [ ] Publish trip
  - [ ] Approve booking
  - [ ] Reject booking (with refund)
  - [ ] Upload media to library
  - [ ] Create blog post
  - [ ] Manage hero slides
  - [ ] View analytics
  - [ ] Assign roles to users

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

---

## 📚 Documentation

### User-Facing Documentation

- [ ] USER_GUIDE.md complete and reviewed
- [ ] FAQs added to website
- [ ] Help Center articles written (if applicable)
- [ ] Contact information accurate (email, phone)

### Developer Documentation

- [ ] README.md comprehensive (setup, installation, development)
- [ ] API_REFERENCE.md complete with all endpoints
- [ ] Swagger/OpenAPI spec up-to-date (`/api-docs`)
- [ ] ADMIN_GUIDE.md reviewed by admin users
- [ ] DEPLOYMENT.md tested by following steps
- [ ] EMAIL_SETUP.md tested with real provider
- [ ] Database schema documented (Prisma comments added)

### Legal & Policies

- [ ] Terms of Service page exists and reviewed by legal
- [ ] Privacy Policy page exists and GDPR compliant
- [ ] Refund/Cancellation Policy documented
- [ ] Cookie Policy (if using analytics)
- [ ] Copyright notices in footer

---

## 🔒 Security

### Authentication & Authorization

- [ ] JWT secrets are strong (64+ characters)
- [ ] Refresh tokens stored in HttpOnly cookies
- [ ] Passwords hashed with bcrypt (salt rounds = 10)
- [ ] Password reset tokens expire after 1 hour
- [ ] RBAC permissions properly enforced
- [ ] No sensitive data in JWT payload
- [ ] Session timeout configured (15 min for access token)

### API Security

- [ ] CORS configured correctly (only allow frontend domain)
- [ ] Rate limiting enabled (100 req/15min global, 5 req/15min auth)
- [ ] Helmet.js enabled (security headers)
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (sanitize HTML input)
- [ ] CSRF protection (for state-changing operations)

### Environment Variables

- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files not committed to Git
- [ ] `.env.example` files created and documented
- [ ] Production environment variables set in Render/Vercel
- [ ] Development vs production configs separated

### Dependencies

- [ ] No critical vulnerabilities (`npm audit`)
- [ ] All packages up-to-date (or documented why not)
- [ ] Unused packages removed
- [ ] License compatibility checked

### Infrastructure

- [ ] HTTPS enforced (no HTTP)
- [ ] SSL certificate valid and auto-renewing
- [ ] Database accessible only from backend (not public)
- [ ] Redis accessible only from backend
- [ ] Cloudinary upload presets secured
- [ ] Razorpay webhook signature verified

---

## ⚡ Performance

### Frontend Optimization

- [ ] Images optimized (compressed, next/image used)
- [ ] Code splitting enabled (Next.js automatic)
- [ ] Lazy loading for below-the-fold content
- [ ] Critical CSS inlined
- [ ] Fonts optimized (next/font)
- [ ] Bundle size reasonable (< 500KB initial load)
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Backend Optimization

- [ ] Database queries optimized (use `select`, `include` wisely)
- [ ] N+1 queries eliminated
- [ ] Indexes added to frequently queried columns
- [ ] Redis caching implemented for hot data
- [ ] API response times < 500ms (95th percentile)
- [ ] Pagination implemented for all list endpoints
- [ ] Background jobs for async tasks (emails, notifications)

### Load Testing

- [ ] Load tested with 100 concurrent users
- [ ] API handles 1000 requests/min without errors
- [ ] Database connection pool sized appropriately (20-50)
- [ ] No memory leaks detected

---

## 🏗️ Infrastructure

### Hosting Setup

- [ ] **Backend (Render)**:
  - [ ] Web Service created and configured
  - [ ] Build command correct
  - [ ] Start command correct
  - [ ] Health check endpoint configured (`/health`)
  - [ ] Auto-deploy from `main` branch enabled (optional)
- [ ] **Frontend (Vercel)**:
  - [ ] Project imported and configured
  - [ ] Build settings correct
  - [ ] Auto-deploy from `main` branch enabled
  - [ ] Preview deployments configured

- [ ] **Database (Render PostgreSQL)**:
  - [ ] Instance created and accessible
  - [ ] Backup schedule enabled (daily)
  - [ ] Connection pooling configured
  - [ ] Max connections set appropriately

- [ ] **Redis (Render Redis)**:
  - [ ] Instance created and accessible
  - [ ] Eviction policy set (allkeys-lru or volatile-lru)

### Domain & DNS

- [ ] Custom domain purchased (if not using .vercel.app)
- [ ] DNS records configured:
  - [ ] A/CNAME record pointing to Vercel
  - [ ] API subdomain (api.paramadventures.com) → Render
- [ ] SSL certificate issued and active
- [ ] WWW redirect configured (www → non-www or vice versa)
- [ ] Email domain verified (SPF, DKIM records) for Resend/Brevo

### Monitoring & Logging

- [ ] Sentry projects created (frontend + backend)
- [ ] Sentry DSNs added to environment variables
- [ ] Error tracking tested (trigger test error)
- [ ] Sentry alerts configured (email/Slack)
- [ ] Uptime monitoring set up (UptimeRobot, Better Uptime)
- [ ] Performance monitoring enabled (Vercel Analytics)
- [ ] Log rotation configured (if self-hosting)

---

## 🔌 Third-Party Services

### Cloudinary (Media Storage)

- [ ] Account created
- [ ] API keys obtained and added to env vars
- [ ] Upload folder configured (`paramadventures/`)
- [ ] Transformation presets created (if needed)
- [ ] Usage limits checked (free tier: 25 GB storage, 25 GB bandwidth/month)
- [ ] Test upload successful from production

### Razorpay (Payments)

- [ ] **Live Mode**:
  - [ ] Account activated (KYC completed)
  - [ ] Live API keys obtained
  - [ ] Webhook URL configured: `https://api.yourdomain.com/payments/webhook`
  - [ ] Webhook secret saved
- [ ] Test payment in production (₹1 test)
- [ ] Refund process tested
- [ ] Payment failure handling tested
- [ ] Invoice/Receipt generation working

### Email Service (Resend/Brevo)

- [ ] Account created
- [ ] Domain verified (SPF, DKIM)
- [ ] SMTP credentials obtained
- [ ] From email configured and verified
- [ ] Test email sent successfully
- [ ] Email templates reviewed (welcome, password reset, booking confirmation)
- [ ] Unsubscribe link added (if sending marketing emails)
- [ ] Email deliverability tested (check spam folder)

### Sentry (Error Tracking)

- [ ] Projects created for frontend and backend
- [ ] Source maps uploaded (frontend)
- [ ] Release tracking configured
- [ ] Alerts set up (email/Slack)
- [ ] Test error captured successfully

### Google OAuth (Optional)

- [ ] OAuth app created in Google Console
- [ ] Credentials obtained
- [ ] Authorized redirect URIs configured
- [ ] Test login successful

---

## 🗄️ Database

### Schema & Migrations

- [ ] Prisma schema reviewed and finalized
- [ ] All migrations applied (`npx prisma migrate deploy`)
- [ ] No pending migrations (`npx prisma migrate status`)
- [ ] Database indexes created for performance
- [ ] Foreign key constraints verified
- [ ] Cascade delete rules appropriate

### Seed Data

- [ ] Production database seeded with:
  - [ ] Admin user (SUPER_ADMIN role)
  - [ ] Sample trips (if needed for demo)
  - [ ] Hero slides for homepage
  - [ ] FAQs
- [ ] Seed scripts tested (`npm run seed`)
- [ ] No test data in production

### Backup

- [ ] Manual backup taken before migration
- [ ] Automated backups enabled (Render Starter plan or higher)
- [ ] Backup restore tested
- [ ] Backup storage location documented

---

## 🚀 Deployment

### Pre-Deployment

- [ ] All environment variables documented in `.env.example`
- [ ] Deployment guide followed step-by-step (DEPLOYMENT.md)
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Maintenance page ready (if needed)

### Deployment Steps

- [ ] **Database**:
  - [ ] Backup taken
  - [ ] Migrations applied
  - [ ] Seed data loaded

- [ ] **Backend (Render)**:
  - [ ] All environment variables set
  - [ ] Manual deploy triggered (or auto from `main`)
  - [ ] Build successful
  - [ ] Health check passing (`/health`)

- [ ] **Frontend (Vercel)**:
  - [ ] All environment variables set
  - [ ] Deployed from `main` branch
  - [ ] Build successful
  - [ ] Preview URL tested
  - [ ] Promoted to production domain

### Smoke Tests (Production)

- [ ] Frontend homepage loads
- [ ] API health endpoint returns 200
- [ ] User registration works
- [ ] User login works
- [ ] Browse trips works
- [ ] View trip details works
- [ ] Booking flow works (with test payment)
- [ ] Admin login works
- [ ] Images loading correctly (Cloudinary)
- [ ] No CORS errors in browser console
- [ ] No 500 errors in Sentry

---

## ✅ Post-Deployment

### Monitoring (First 24 Hours)

- [ ] Check Sentry for errors every 2 hours
- [ ] Monitor uptime (should be 99.9%+)
- [ ] Review Vercel Analytics (page load times)
- [ ] Check Render logs for warnings
- [ ] Monitor database CPU and memory usage
- [ ] Verify email delivery (check sent emails in provider dashboard)
- [ ] Check payment gateway transactions

### User Communication

- [ ] Announce launch (email, social media)
- [ ] Share user guide with early users
- [ ] Set up support channels (email, phone, live chat)
- [ ] Prepare FAQ responses for common issues

### Compliance & Legal

- [ ] GDPR compliance verified (if serving EU users)
- [ ] Cookie consent banner added (if using tracking)
- [ ] Privacy Policy reviewed by legal
- [ ] Terms of Service accepted during registration

### Analytics & Tracking

- [ ] Google Analytics configured (if using)
- [ ] Conversion tracking set up (bookings, registrations)
- [ ] Funnel analysis configured
- [ ] Event tracking tested

### Team Training

- [ ] Admin team trained on dashboard
- [ ] Support team has access to admin guide
- [ ] Escalation process documented
- [ ] On-call schedule set (for emergencies)

---

## 🐛 Known Issues & Workarounds

Document any known issues that are non-blocking:

| Issue                         | Severity | Workaround                   | Planned Fix |
| ----------------------------- | -------- | ---------------------------- | ----------- |
| Example: OAuth sometimes slow | Low      | Users can use email/password | v1.1        |
|                               |          |                              |             |

---

## 📞 Emergency Contacts

| Role            | Name   | Contact       |
| --------------- | ------ | ------------- |
| Release Manager | [Name] | [Email/Phone] |
| Backend Lead    | [Name] | [Email/Phone] |
| Frontend Lead   | [Name] | [Email/Phone] |
| DevOps          | [Name] | [Email/Phone] |
| Support Lead    | [Name] | [Email/Phone] |

---

## 🎉 Launch Day Schedule

| **Time** (IST) | **Task**             | **Owner**    | **Status** |
| -------------- | -------------------- | ------------ | ---------- |
| 10:00 AM       | Final code review    | Backend Lead | ⏳         |
| 11:00 AM       | Database backup      | DevOps       | ⏳         |
| 11:15 AM       | Deploy backend       | DevOps       | ⏳         |
| 11:30 AM       | Deploy frontend      | DevOps       | ⏳         |
| 11:45 AM       | Smoke tests          | QA Team      | ⏳         |
| 12:00 PM       | Go live (update DNS) | DevOps       | ⏳         |
| 12:15 PM       | Announce launch      | Marketing    | ⏳         |
| 12:30 PM       | Monitor for 30 min   | All Hands    | ⏳         |

---

## 📝 Sign-Off

**Checklist Completed By**: **********\_\_********** **Date**: ****\_\_****

**Approved By (Tech Lead)**: **********\_\_********** **Date**: ****\_\_****

**Approved By (Product Owner)**: **********\_\_********** **Date**: ****\_\_****

---

## 🔄 Post-Launch Review (7 Days)

Schedule a review meeting one week after launch to discuss:

- Issues encountered and resolutions
- User feedback
- Performance metrics
- Lessons learned
- Priorities for v1.1

---

**Remember**: It's okay to delay launch if critical items aren't checked off. Quality over speed!

Good luck with your launch! 🚀
