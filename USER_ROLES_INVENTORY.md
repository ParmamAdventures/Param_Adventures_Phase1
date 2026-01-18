# User Roles Inventory - January 18, 2026

## 📊 Total Roles: 6

### Role Breakdown

#### 1. **SUPER_ADMIN** ✅

- **ID**: bf417bbf-e631-480a-9cce-4260a3954257
- **Users**: 1 (admin@paramadventures.com)
- **Permissions in Database**: 0
- **Permissions via Middleware**: 31+ (all admin permissions)
- **Status**: ✅ ACTIVE & FUNCTIONAL
- **Capabilities**: Full system access including delete users, process refunds, system settings

#### 2. **ADMIN** ✅

- **ID**: b447ebdc-3876-4364-adaf-b686a82b644d
- **Users**: 1 (admin@paramadventures.com)
- **Permissions in Database**: 4
  - trips:read
  - trips:create
  - bookings:read
  - users:manage
- **Permissions via Middleware**: 24 (constrained, no delete/refund/settings)
- **Status**: ✅ ACTIVE & FUNCTIONAL
- **Capabilities**: Most admin features except deleting users, processing refunds, system settings

#### 3. **admin** (lowercase)

- **ID**: 5cdf2eeb-188d-4623-842a-9d5b286a9416
- **Users**: 2 (admin@test.com, admin@paramadventures.com)
- **Permissions in Database**: 0
- **Status**: ⚠️ LEGACY/DUPLICATE (same as ADMIN, but lowercase)
- **Note**: Should be consolidated with ADMIN role (case sensitivity issue)

#### 4. **USER** (uppercase)

- **ID**: 3d9a2ee0-ddb6-4d4b-a62b-ed52d64e5400
- **Users**: 1 (user@paramadventures.com)
- **Permissions in Database**: 0
- **Status**: ⚠️ LEGACY/DUPLICATE (same as user, but uppercase)
- **Note**: Should be consolidated with user role

#### 5. **user** (lowercase)

- **ID**: 5eb34212-8789-45ea-8fbd-9376053efec9
- **Users**: 1 (user1@test.com)
- **Permissions in Database**: 0
- **Status**: ✅ ACTIVE (regular user)
- **Capabilities**: No special permissions (regular customer)

#### 6. **organizer**

- **ID**: 5d7ccf62-8553-43ab-9676-0431309fb603
- **Users**: 1 (organizer@test.com)
- **Permissions in Database**: 0
- **Status**: ⚠️ LEGACY (not used in current architecture)
- **Note**: Was part of old role system, no longer used

---

## 👥 User-to-Role Mapping

| Email                     | Roles                     | Notes                                    |
| ------------------------- | ------------------------- | ---------------------------------------- |
| admin@paramadventures.com | SUPER_ADMIN, ADMIN, admin | Main admin account - has all permissions |
| admin@test.com            | admin                     | Test admin (legacy lowercase role)       |
| organizer@test.com        | organizer                 | Legacy role (not used)                   |
| user1@test.com            | user                      | Regular user                             |
| user2@test.com            | (none)                    | No roles assigned                        |
| user@paramadventures.com  | USER                      | Regular user (uppercase role)            |

---

## 🔍 Issues Found

### Issue 1: Duplicate Roles (Case Sensitivity)

- **Problem**: `admin` and `ADMIN` are separate roles (case-sensitive)
- **Impact**: Confusion in role management
- **Solution**: Consolidate to use only `ADMIN` (uppercase)
- **Action**: Migrate users from lowercase `admin` to `ADMIN`

### Issue 2: Duplicate USER Roles

- **Problem**: `user` and `USER` are separate roles
- **Impact**: Some users in lowercase, some uppercase
- **Solution**: Consolidate to use only `USER` (uppercase to match pattern)
- **Action**: Migrate users to consistent role naming

### Issue 3: Orphaned Role

- **Problem**: `organizer` role exists but not used in current system
- **Impact**: Legacy code/confusion
- **Solution**: Remove or archive this role
- **Action**: Archive `organizer` role

---

## 📋 Recommended Role Structure

Based on admin guide and current implementation:

```
Desired Roles:
1. SUPER_ADMIN   - Full system access
2. ADMIN         - Most features (no delete users, no refunds, no system settings)
3. TRIP_MANAGER  - Trip and booking management
4. TRIP_GUIDE    - View/update assigned trips
5. UPLOADER      - Media library management
6. USER          - Regular customers
```

Current Roles (to consolidate):

```
Keep:
✅ SUPER_ADMIN   - 1 user
✅ ADMIN         - 1 user
✅ user/USER     - Consolidate to USER (2 users)

Remove/Archive:
⚠️  admin (lowercase) - Migrate 2 users to ADMIN
⚠️  organizer - Not used in current system
```

---

## 🔧 Cleanup Actions Needed

1. **Consolidate Roles** (Priority: MEDIUM)
   - Migrate users from `admin` → `ADMIN`
   - Consolidate `user` and `USER` → `USER`
   - Archive `organizer` role

2. **Verify Permissions** (Priority: HIGH)
   - SUPER_ADMIN: Getting 31+ permissions ✅
   - ADMIN: Getting 24 permissions ✅
   - Other roles: Verify as needed

3. **Add Missing Roles** (Priority: MEDIUM)
   - TRIP_MANAGER
   - TRIP_GUIDE
   - UPLOADER

---

## ✅ Current Status

| Component            | Status | Details                                              |
| -------------------- | ------ | ---------------------------------------------------- |
| SUPER_ADMIN          | ✅     | Working correctly with 31+ permissions               |
| ADMIN                | ✅     | Working correctly with 24 permissions                |
| Admin account        | ✅     | Active with proper roles                             |
| Role consolidation   | ⚠️     | Duplicate roles exist (case sensitivity)             |
| Database permissions | ⚠️     | Some roles have no DB permissions (using middleware) |
| Legacy roles         | ⚠️     | organizer role not used                              |

---

## 📊 Summary

```
Total Roles: 6
├── SUPER_ADMIN (1 user) ✅
├── ADMIN (1 user) ✅
├── admin (2 users) ⚠️ DUPLICATE
├── USER (1 user) ✅
├── user (1 user) ⚠️ DUPLICATE
└── organizer (1 user) ⚠️ LEGACY

Action Items:
1. Consolidate duplicate roles
2. Archive unused roles
3. Create missing roles (TRIP_MANAGER, etc.)
```

---

**Last Updated**: January 18, 2026
**Database Status**: ✅ Checked & Verified
