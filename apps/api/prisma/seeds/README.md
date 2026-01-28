# Seed Files Documentation

## Overview

Seed files are organized into two categories:

- **Production**: Safe for staging/demo environments
- **Test**: Development and E2E testing only

## Production Seed

**Location:** `prisma/seeds/production/index.ts`

### What It Creates

- ✅ RBAC system (6 roles, 33 permissions)
- ✅ 7 users (super admin, admin, manager, 2 guides, 3 customers)
- ✅ 5 featured trips with full details
- ✅ 8 images
- ✅ 5 hero slides for homepage
- ✅ 5 blog posts (4 published, 1 draft)
- ✅ 3 bookings with payments
- ✅ 3 reviews
- ✅ Site configuration

### Safety Features

- Uses environment variables for admin credentials
- Validates environment before running
- Requires `ALLOW_PROD_SEED=true` in production
- No hardcoded passwords

### Usage

**Development:**

```bash
cd apps/api
npm run seed
```

**Production/Staging:**

```bash
# Set environment variables first
ADMIN_EMAIL=admin@yourcompany.com \
ADMIN_PASSWORD=YourSecurePassword123! \
ALLOW_PROD_SEED=true \
npm run seed:prod
```

### Environment Variables Required

| Variable          | Description                | Example                     |
| ----------------- | -------------------------- | --------------------------- |
| `ADMIN_EMAIL`     | Admin user email           | `admin@paramadventures.com` |
| `ADMIN_PASSWORD`  | Admin user password        | `SecurePass123!`            |
| `ALLOW_PROD_SEED` | Safety flag for production | `true`                      |

### Demo Credentials

After seeding, you can log in with:

| Role     | Email                           | Password       |
| -------- | ------------------------------- | -------------- |
| Admin    | (from env var)                  | (from env var) |
| Manager  | manager@paramadventures.com     | Demo@2026      |
| Guide    | guide.rahul@paramadventures.com | Demo@2026      |
| Customer | amit.patel@email.com            | Demo@2026      |

---

## Test Seeds

**Location:** `prisma/seeds/test/`

These files contain test data with hardcoded credentials. **Never use in production!**

### Available Test Seeds

- `seed_comprehensive.mjs` - Full demo data
- `seed_test_users.mjs` - Test users only
- `seed_e2e.mjs` - Minimal E2E test data
- `seed_minimal.cjs` - Minimal test data

### Usage

```bash
# Run comprehensive test seed
npm run seed:test

# Run legacy seed
npm run seed:legacy
```

---

## Best Practices

### Development

✅ Use `npm run seed` for local development  
✅ Run seeds after db migrations  
✅ Clear data before reseeding

### Staging/Demo

✅ Set proper environment variables  
✅ Use production seed only  
✅ Never use test seeds  
✅ Change demo passwords after seeding

### Production

⚠️ **Never run seeds in production!**  
⚠️ If absolutely necessary:

- Back up database first
- Set `ALLOW_PROD_SEED=true` explicitly
- Use strong passwords
- Review all created data

---

## Troubleshooting

### "Missing required environment variables"

Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your `.env` file:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
```

### "Cannot seed production without ALLOW_PROD_SEED=true"

This is intentional! Only bypass in controlled environments:

```bash
ALLOW_PROD_SEED=true npm run seed:prod
```

### "Migration out of sync"

Run migrations before seeding:

```bash
npx prisma migrate dev
npm run seed
```

---

## Migration Guide

If you have existing seed scripts:

1. **Check current data:** Don't lose important data!
2. **Backup database:** `pg_dump` or similar
3. **Run new seed:** `npm run seed`
4. **Verify data:** Check admin login, trips, etc.
5. **Update deployment scripts:** Use new seed commands

---

## Support

For issues or questions about seeding:

1. Check this README
2. Review seed file code
3. Check `.env` file configuration
4. Verify database connection
