# Security Best Practices - Param Adventures

Security guidelines and hardening strategies.

---

## 🔐 Core Security Principles

1. **Least Privilege**: Users get minimum permissions needed
2. **Defense in Depth**: Multiple layers of security
3. **Secure by Default**: Safe configurations out of the box
4. **Never Trust Input**: Validate everything
5. **Fail Securely**: Errors don't expose sensitive info

---

## 🔑 Authentication

### Password Security

```typescript
// apps/api/src/utils/passwordHash.ts
import bcrypt from "bcryptjs";

// Hash password on registration
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12); // High cost factor
  return bcrypt.hash(password, salt);
}

// Verify on login
async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements

```env
# apps/api/.env
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_EXPIRY_DAYS=90
```

```typescript
// Enforce strong passwords
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors = [];

  if (password.length < 12) errors.push("Minimum 12 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase");
  if (!/[0-9]/.test(password)) errors.push("Must contain numbers");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Must contain symbols");

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### JWT Token Security

```typescript
// Generate secure tokens
function generateToken(userId: string) {
  return jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET!, {
    expiresIn: "1h", // Short expiry
    algorithm: "HS256",
    audience: "api.paramadventures.com",
    issuer: "paramadventures",
  });
}

// Refresh token (kept in secure httpOnly cookie)
function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
      algorithm: "HS256",
    }
  );
}
```

### Session Management

```typescript
// Invalidate tokens on logout
async function logout(userId: string) {
  // Add token to blacklist
  await redis.setex(
    `logout:${userId}`,
    3600, // 1 hour
    "true"
  );

  // Check in middleware
  if (await redis.exists(`logout:${userId}`)) {
    throw new Error("Token has been revoked");
  }
}
```

---

## 🛡️ Authorization

### Role-Based Access Control (RBAC)

```typescript
// apps/api/src/middleware/authz.ts
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const hasRole = userRoles.some((ur) => roles.includes(ur.role.name));

    if (!hasRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Usage
app.post(
  "/admin/users",
  requireRole("admin", "super_admin"),
  createUserHandler
);
```

### Permission Checking

```typescript
// Verify resource ownership before operations
async function updateTrip(tripId: string, userId: string, data: any) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (trip?.creatorId !== userId && !isAdmin(userId)) {
    throw new Error("Unauthorized");
  }

  return prisma.trip.update({
    where: { id: tripId },
    data,
  });
}
```

---

## 🔒 Data Protection

### Encryption at Rest

```typescript
// Encrypt sensitive fields
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

function encryptField(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptField(encrypted: string): string {
  const [iv, authTag, encryptedData] = encrypted.split(':');
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage in Prisma
model User {
  id String @id
  email String
  phone String  // Will be encrypted/decrypted

  @@index([email])
}

// Create hooks to auto-encrypt/decrypt
```

### Encryption in Transit

```env
# apps/api/.env
# Use HTTPS only
NODE_ENV=production
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem

# Strict security headers
HSTS_MAX_AGE=31536000
```

```typescript
// Set security headers
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Restrict in production
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "https:", "data:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny", // Prevent clickjacking
    },
  })
);
```

---

## 🚫 Input Validation

### Sanitization

```typescript
// apps/api/src/middleware/sanitizer.ts
import { sanitize, escape } from "sanitize-html";

export function sanitizeInput(data: any): any {
  if (typeof data === "string") {
    return escape(data); // HTML escape user input
  }
  if (typeof data === "object") {
    return Object.entries(data).reduce((acc, [key, val]) => {
      acc[key] = sanitizeInput(val);
      return acc;
    }, {} as any);
  }
  return data;
}
```

### SQL Injection Prevention

```typescript
// ✅ Always use parameterized queries (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Safe - parameterized
});

// ❌ Never use raw SQL with string concatenation
// const user = await prisma.$queryRaw(`SELECT * FROM User WHERE email = '${userInput}'`);

// If raw SQL is needed:
const user = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userInput}
`;
```

### XSS Prevention

```typescript
// apps/api/src/middleware/xss.ts
import xss from "xss";

export function sanitizeXSS(data: string) {
  return xss(data, {
    whiteList: {}, // No HTML allowed
    stripIgnoredTag: true,
  });
}

// Usage
const title = sanitizeXSS(req.body.title);
```

### CSRF Protection

```typescript
// apps/api/src/middleware/csrf.ts
import csrf from "csurf";
import cookieParser from "cookie-parser";

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Provide token to frontend
app.get("/csrf-token", (req, res) => {
  res.json({ token: req.csrfToken() });
});

// Verify on POST/PUT/DELETE
app.post("/api/trips", csrfProtection, createTripHandler);
```

---

## 🔐 API Security

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  skipSuccessfulRequests: true, // Only count failures
  message: "Too many accounts created, try again later",
});

app.post("/auth/register", createAccountLimiter, registerHandler);

// Stricter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false, // Count all attempts
});

app.post("/auth/login", loginLimiter, loginHandler);
```

### API Key Security

```env
# apps/api/.env
API_KEYS=key1:secret1,key2:secret2
```

```typescript
// Verify API key from headers
export function validateApiKey(req: Request) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Missing API key");
  }

  const validKeys = process.env.API_KEYS?.split(",") || [];
  if (!validKeys.includes(apiKey)) {
    throw new Error("Invalid API key");
  }
}
```

### Request Size Limits

```typescript
// Prevent large payload attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb" }));

// File upload limits
app.post("/upload", (req, res) => {
  if (req.file?.size > 5 * 1024 * 1024) {
    // 5MB limit
    return res.status(413).json({ error: "File too large" });
  }
});
```

---

## 💳 Payment Security

### PCI Compliance

```typescript
// Never store full credit card numbers
// Razorpay handles card tokenization

// ✅ Secure way - store Razorpay token
const payment = await razorpay.payments.create({
  amount: amount * 100, // in paise
  currency: "INR",
  email: user.email,
  contact: user.phone,
});

// Store payment reference, not card details
await prisma.payment.create({
  data: {
    razorpayPaymentId: payment.id,
    userId,
    amount,
    status: "created",
  },
});
```

### Webhook Validation

```typescript
// Verify Razorpay webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  return hash === signature;
}

// Usage
app.post("/webhooks/razorpay", (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  if (!verifyWebhookSignature(body, signature as string)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook
  handlePaymentEvent(req.body);
  res.json({ ok: true });
});
```

---

## 📋 Audit & Logging

### Security Event Logging

```typescript
// apps/api/src/utils/auditLog.ts
async function logSecurityEvent(
  event: "LOGIN" | "LOGOUT" | "PERMISSION_DENIED" | "DATA_ACCESS",
  userId: string,
  details: any
) {
  await prisma.auditLog.create({
    data: {
      event,
      userId,
      details,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      timestamp: new Date(),
    },
  });
}

// Never log sensitive data
// ❌ Don't log passwords, tokens, cards
// ✅ Do log: event type, user, timestamp, IP, success/failure
```

### Error Handling

```typescript
// Don't expose sensitive info in error messages
// ❌ Bad
res.status(500).json({ error: `Database error: ${error.message}` });

// ✅ Good
logger.error(error); // Log full error internally
res.status(500).json({ error: "An error occurred" }); // Generic to client
```

---

## 🔄 Security Checklist

### Before Production

- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens have short expiry
- [ ] HTTPS enabled
- [ ] Security headers configured (helmet)
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled
- [ ] Error messages sanitized
- [ ] Secrets in environment variables
- [ ] Database backups automated
- [ ] Security dependencies up-to-date
- [ ] Razorpay webhook secrets verified
- [ ] Payment data never stored locally

### Regular Maintenance

- [ ] Run `npm audit` weekly
- [ ] Rotate secrets quarterly
- [ ] Review audit logs monthly
- [ ] Penetration testing annually
- [ ] Update dependencies regularly
- [ ] Monitor failed login attempts

---

## 🚨 Incident Response

### Account Compromise

```bash
1. Invalidate all tokens for user
   - Clear Redis cache
   - Force re-authentication

2. Force password reset
   - Send email notification
   - Require new password

3. Review audit logs
   - Check login history
   - Look for unauthorized actions

4. Notify user immediately
```

### Data Breach

```bash
1. Stop the attack
   - Take affected systems offline if needed
   - Revoke compromised credentials

2. Assess damage
   - Identify what data was accessed
   - Determine exposure scope

3. Notify affected users
   - Follow legal requirements (GDPR, etc.)
   - Provide credit monitoring if needed

4. Improve security
   - Patch vulnerabilities
   - Add monitoring
```

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Security](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/relation-queries)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
