# OPT-001: Boolean Variable Naming Convention

**Status**: IN PROGRESS  
**Priority**: LOW  
**Estimated Time**: 2 hours  
**Completed**: 2/50+ files (4%)

## Goal

Rename all boolean state variables to use `is/has/should` prefixes for better code readability.

Examples:
- `loading` → `isLoading`
- `enabled` → `isEnabled`
- `authenticated` → `isAuthenticated`
- `verified` → `isVerified`

## Progress

### ✅ Completed (2 files)

| File | Old Name | New Name | Status |
|------|----------|----------|--------|
| `hooks/useSiteConfig.ts` | `loading` | `isLoading` | ✅ Done |
| `hooks/useRoles.ts` | `loading` | `isLoading` | ✅ Done |

### 🔄 Pending - High Priority (Widely Used)

These affect multiple files and should be done next:

| File | Variable | New Name | Usages | Impact |
|------|----------|----------|--------|--------|
| `context/AuthContext.tsx` | `loading` | `isLoading` | 50+ | HIGH - Used in almost every authenticated page |
| `hooks/useRazorpay.ts` | `loading` | `isLoading` | 10+ | HIGH - Payment flows |

### 📋 Pending - Components (48 files)

#### Booking Components
- `components/bookings/BookingModal.tsx` - `loading` → `isLoading`
- `components/bookings/CancelBookingDialog.tsx` - `loading` → `isLoading`

#### Trip Components  
- `components/trips/TripBookingCard.tsx` - `loading` → `isLoading`
- `components/trips/TripDetailClient.tsx` - `loading` → `isLoading`
- `components/trips/HeartButton.tsx` - `loading` → `isLoading`

#### Media Components
- `components/media/ImageUploader.tsx` - `loading` → `isLoading`
- `components/media/DocumentUploader.tsx` - `loading` → `isLoading`
- `components/media/CroppedImageUploader.tsx` - `loading` → `isLoading`

#### Editor Components
- `components/editor/BlogEditor.tsx` - `uploading` → `isUploading`

#### Search & Review Components
- `components/search/SearchOverlay.tsx` - `loading` → `isLoading`
- `components/reviews/ReviewList.tsx` - `loading` → `isLoading`

#### Home Components
- `components/home/Testimonials.tsx` - `loading` → `isLoading`
- `components/home/LatestBlogsSection.tsx` - `loading` → `isLoading`

#### Admin/Manager Components
- `components/manager/AssignCrewModal.tsx` - `loading` → `isLoading`
- `components/manager/ReviewDocsModal.tsx` - `loading` → `isLoading`
- `components/guide/UploadDocsModal.tsx` - `loading` → `isLoading`

### 📋 Pending - Pages (35+ files)

#### Auth Pages
- `app/login/page.tsx` - `loading` → `isLoading`
- `app/signup/page.tsx` - `loading` → `isLoading`
- `app/auth/forgot-password/page.tsx` - `loading` → `isLoading`
- `app/auth/reset-password/page.tsx` - `loading` → `isLoading`

#### Dashboard Pages
- `app/dashboard/page.tsx` - `loading` → `isLoading`
- `app/dashboard/profile/page.tsx` - `loading`, `uploading` → `isLoading`, `isUploading`
- `app/dashboard/bookings/page.tsx` - `loading` → `isLoading`
- `app/dashboard/wishlist/page.tsx` - `loading` → `isLoading`
- `app/dashboard/guide/page.tsx` - `loading` → `isLoading`

#### Trip Pages
- `app/trips/new/page.tsx` - `submitting` → `isSubmitting`
- `app/trips/internal/page.tsx` - `loading` → `isLoading`

#### My Bookings
- `app/my-bookings/page.tsx` - `loading` → `isLoading`

#### Admin Pages
- `app/admin/analytics/page.tsx` - `loading` → `isLoading`
- `app/admin/audit-logs/page.tsx` - `loading` → `isLoading`
- `app/admin/blogs/page.tsx` - `loading` → `isLoading`
- `app/admin/blogs/[id]/page.tsx` - `loading` → `isLoading`
- `app/admin/bookings/page.tsx` - `loading` → `isLoading`
- `app/admin/content/page.tsx` - `loading` → `isLoading` (2 instances)
- `app/admin/inquiries/page.tsx` - `loading` → `isLoading`
- `app/admin/media/page.tsx` - `loading`, `uploading` → `isLoading`, `isUploading`
- `app/admin/moderation/page.tsx` - `loading` → `isLoading`
- `app/admin/roles/page.tsx` - `loading` → `isLoading`
- `app/admin/trips/page.tsx` - `loading` → `isLoading`
- `app/admin/trips/new/page.tsx` - `submitting` → `isSubmitting`
- `app/admin/trips/[tripId]/edit/page.tsx` - `loading`, `submitting` → `isLoading`, `isSubmitting`
- `app/admin/trips/[tripId]/bookings/page.tsx` - `loading` → `isLoading`
- `app/admin/users/page.tsx` - `loading` → `isLoading`

## API Files (Backend) - Separate Task

The API codebase also has boolean variables that should follow the same pattern:
- Controller response properties
- Service method parameters
- Middleware flags

## Automation Strategy

For future batches, consider:
1. Use a TypeScript AST transformer
2. Or use find/replace with regex in VS Code
3. Run type checking after each batch to catch breaking changes

## Next Steps

1. ✅ Complete hooks (Done: 2/2)
2. 🔄 Update AuthContext (HIGH impact)
3. 🔄 Update useRazorpay (Payment critical)
4. Update remaining components in batches
5. Update all pages
6. Run full test suite
7. Commit with detailed message

## Risk Assessment

**Risk Level**: MEDIUM
- Many files affected (50+)
- Breaking changes in prop interfaces
- Requires careful testing

**Mitigation**:
- Do in small batches
- Test after each batch
- Use TypeScript compiler to catch errors
- Focus on high-impact files first

## Time Breakdown

- Hooks: 15 mins ✅
- AuthContext: 30 mins
- Components: 45 mins
- Pages: 60 mins
- Testing: 30 mins
- **Total**: ~3 hours (revised from 2 hours)

