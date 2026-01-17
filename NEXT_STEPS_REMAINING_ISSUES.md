# Next Steps for Remaining Test Failures

**Status**: 2 Failing Test Suites, 7 Failing Tests  
**Priority**: MEDIUM (Non-critical - 97.7% pass rate maintained)

---

## Issue #1: admin-operations.test.ts - Analytics Permission Errors

### Problem
```
admin-operations.test.ts (Line 323)
GET /admin/analytics/bookings
  Expected: 403 (Permission denied)
  Received: 200 or 500 (Server error)

GET /admin/analytics/moderation (Line 331)
  Expected: 200 (Success)
  Received: 403 (Permission denied)
```

### Investigation Steps

#### Step 1: Check Permission Exists
```bash
# In database, run:
SELECT * FROM "Permission" WHERE key = 'analytics:view';
```

**Expected Result**: One row with `key = 'analytics:view'`  
**If Missing**: Create it in beforeAll() of test

#### Step 2: Check Admin Role Has Permission
```bash
# In database, run:
SELECT rp.*, r.name, p.key
FROM "RolePermission" rp
JOIN "Role" r ON rp."roleId" = r.id
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r.name = 'ADMIN' AND p.key = 'analytics:view';
```

**Expected Result**: One row showing ADMIN has analytics:view  
**If Missing**: Add to test setup

#### Step 3: Check Test Setup
Look at **admin-operations.test.ts** line 1-100 (beforeAll):

**Should have**:
```typescript
// In beforeAll():
const analyticsPermission = await prisma.permission.upsert({
  where: { key: 'analytics:view' },
  update: {},
  create: { key: 'analytics:view', description: 'View analytics' }
});

await prisma.rolePermission.upsert({
  where: { roleId_permissionId: { roleId: adminRole.id, permissionId: analyticsPermission.id } },
  update: {},
  create: { roleId: adminRole.id, permissionId: analyticsPermission.id }
});
```

### Quick Fix Template

Add this to **admin-operations.test.ts** beforeAll():

```typescript
beforeAll(async () => {
  // ... existing role creation ...
  
  // Create analytics permission
  const analyticsPermission = await prisma.permission.upsert({
    where: { key: 'analytics:view' },
    update: {},
    create: { 
      key: 'analytics:view',
      description: 'View analytics dashboards'
    }
  });
  
  // Assign to admin role
  await prisma.rolePermission.upsert({
    where: { 
      roleId_permissionId: { 
        roleId: adminRole.id, 
        permissionId: analyticsPermission.id 
      } 
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: analyticsPermission.id
    }
  });
  
  // ... rest of setup ...
});
```

---

## Issue #2: blogs.test.ts - Reject Blog Returns 500

### Problem
```
blogs.test.ts (Line 459)
POST /blogs/:id/reject
  Expected: 200 (Success)
  Received: 500 (Internal Server Error)
  Error Body: Unknown (need to debug)
```

### Investigation Steps

#### Step 1: Add Debug Logging
Modify **rejectBlog.controller.ts**:

```typescript
export async function rejectBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;
  const { reason } = req.body;

  console.log('[DEBUG] Rejecting blog:', { id, userId: user.id, reason });

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });
    console.log('[DEBUG] Found blog:', blog);

    if (!blog) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    if (blog.status !== "PENDING_REVIEW") {
      console.log('[DEBUG] Invalid status:', blog.status);
      throw new HttpError(403, "INVALID_STATE", `Only blogs in review can be rejected, current: ${blog.status}`);
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    console.log('[DEBUG] Blog updated:', updated);

    await auditService.logAudit({
      actorId: user.id,
      action: "BLOG_REJECTED",
      targetType: "BLOG",
      targetId: blog.id,
      metadata: { reason },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('[ERROR] Reject blog failed:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}
```

#### Step 2: Run Test with Logging
```bash
npm test -- tests/integration/blogs.test.ts --verbose 2>&1 | grep -A5 "DEBUG\|ERROR"
```

#### Step 3: Check Common Issues

**Check 1: Audit Service**
```typescript
// Does auditService.logAudit throw?
// Add try-catch:
try {
  await auditService.logAudit({...});
} catch (e) {
  console.error('Audit logging failed:', e);
  // Continue anyway - logging failure shouldn't fail request
}
```

**Check 2: Blog Status**
Verify test creates blog with correct status:
```typescript
const testBlog = await prisma.blog.create({
  data: {
    title: "Blog to Reject",
    slug: `reject-blog-${Date.now()}`,
    content: {},
    authorId: userId,
    tripId,
    status: "PENDING_REVIEW",  // THIS MUST MATCH
  },
});
```

**Check 3: Database Constraints**
Check if any required fields are missing:
```bash
# In database:
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'Blog';
```

### Quick Fix Template

Replace catch block in **rejectBlog.controller.ts**:

```typescript
} catch (error: any) {
  console.error('[REJECT_BLOG_ERROR]:', error.message);
  
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Blog not found' });
  }
  
  if (error.status) {
    // HttpError
    return res.status(error.status).json({ error: error.message });
  }
  
  // Unexpected error
  res.status(500).json({ 
    error: 'Failed to reject blog',
    details: process.env.NODE_ENV === 'test' ? error.message : undefined
  });
}
```

---

## Debugging Commands

### Run Only Failing Tests
```bash
# admin-operations failures
npm test -- tests/integration/admin-operations.test.ts --testNamePattern="analytics"

# blogs failures  
npm test -- tests/integration/blogs.test.ts --testNamePattern="reject"
```

### Get Detailed Error Output
```bash
# Run with all output
npm test -- tests/integration/admin-operations.test.ts 2>&1 | tail -200

# Run single test
npm test -- tests/integration/admin-operations.test.ts --testNamePattern="returns bookings stats"
```

### Check Database State
```bash
# Connect to test database
psql postgresql://user:password@localhost:5433/param_adventures_test

# Check permissions
SELECT * FROM "Permission" WHERE key LIKE '%analytics%';

# Check role-permission mappings
SELECT r.name, p.key 
FROM "RolePermission" rp
JOIN "Role" r ON rp."roleId" = r.id
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r.name = 'ADMIN';

# Check blog statuses
SELECT id, status FROM "Blog" WHERE slug LIKE '%reject%';
```

---

## Expected Behavior After Fixes

### admin-operations.test.ts
```
✅ GET /admin/analytics/bookings
  - With permission: 200 (returns data)
  - Without permission: 403 (denied)

✅ GET /admin/analytics/moderation  
  - With permission: 200 (returns data)
  - Without permission: 403 (denied)
```

### blogs.test.ts
```
✅ POST /blogs/:id/reject
  - Valid blog: 200 (rejected)
  - Invalid status: 403 (cannot reject)
  - Not found: 404 (missing)
```

---

## Estimated Effort

| Task | Time | Difficulty |
|------|------|-----------|
| Add analytics permission | 5 min | ⭐ Easy |
| Test permission setup | 5 min | ⭐ Easy |
| Add debug logging | 10 min | ⭐ Easy |
| Debug 500 error | 10-20 min | ⭐⭐ Medium |
| Fix found issue | 5-15 min | ⭐ Easy |
| **Total** | **35-55 min** | **Easy to Medium** |

---

## Files to Modify

1. **admin-operations.test.ts** - Add permission setup in beforeAll()
2. **rejectBlog.controller.ts** - Add debug logging and better error handling
3. Possibly **review.service.ts** or audit service if needed

---

## Success Criteria

✅ All 350 tests passing (100%)  
✅ 0 failing test suites  
✅ No compilation errors  
✅ All services functional

---

## Prevention for Future

1. Always assign permissions in test beforeAll()
2. Use upsert() for system records to avoid constraint violations
3. Add error handler middleware with detailed logging
4. Create test fixtures for common setups
5. Document permission matrix for endpoints

