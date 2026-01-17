# OPT-006: Add JSDoc to Controller Functions

**Status**: 🔄 IN PROGRESS  
**Started**: January 17, 2026  
**Scope**: 76 controller files across 9 feature categories

## Progress Tracking

### Root-Level Controllers (11 files)
- [x] **auth.controller.ts** - 4 functions documented (register, login, refresh, logout)
- [x] **health.controller.ts** - 1 function documented (healthCheck)
- [x] **user.controller.ts** - 1 function documented (updateProfile)
- [ ] **inquiry.controller.ts** - 0/? functions
- [ ] **mediaUpload.controller.ts** - 0/? functions
- [ ] **newsletter.controller.ts** - 0/? functions
- [ ] **paymentEvents.ts** - 0/? functions
- [ ] **razorpayWebhook.controller.ts** - 0/? functions
- [ ] **review.controller.ts** - 0/? functions
- [ ] **siteConfig.controller.ts** - 0/? functions
- [ ] **wishlist.controller.ts** - 0/? functions

### Feature Categories (65 files)
- [ ] **Admin** (13 files) - 0/? functions
- [ ] **Blogs** (11 files) - 0/? functions
- [ ] **Bookings** (8 files) - 0/? functions
- [ ] **Content** (2 files) - 0/? functions
- [ ] **Media** (7 files) - 0/? functions
- [ ] **Payments** (7 files) - 0/? functions
- [ ] **Reviews** (3 files) - 0/? functions
- [ ] **Trips** (14 files) - 0/? functions

## Completed

### Total: 6/76 files (7.9%)
- Files: 3 root-level controllers
- Functions documented: 6 functions

## JSDoc Template Standards

### Authentication Controller Pattern
```typescript
/**
 * Brief function description.
 * @param {Request} req - Express request with specific expected body/params
 * @param {Response} res - Express response
 * @returns {Promise<void>} - Sends response with [specific data]
 * @throws {Error} - Throws if [specific condition]
 */
```

### CRUD Pattern
```typescript
/**
 * Create/Read/Update/Delete operation description.
 * @param {Request} req - Request with [specific fields]
 * @param {Response} res - Response with [specific data]
 * @returns {Promise<void>}
 * @throws {Error} - If [specific error condition]
 */
```

## Next Steps

1. Continue with remaining root-level controllers (8 files)
2. Process admin controllers (13 files)
3. Process trip controllers (14 files)
4. Complete remaining feature categories

## Estimated Effort

- **Completed**: 15 minutes (3 files)
- **Remaining**: ~2 hours (73 files)
- **Total Estimate**: 2-2.5 hours for 76 files
- **Strategy**: Batch processing by category for efficiency

## Notes

- Using consistent JSDoc format across all controllers
- Documenting Request/Response parameters with specific body/params details
- Including @throws documentation for error conditions
- Following TypeScript and Express.js conventions
