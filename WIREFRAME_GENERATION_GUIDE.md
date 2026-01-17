# Wireframe Generation Guide

Automated wireframe generation system for Param Adventures using Playwright.

## Overview

This system captures full-page screenshots of all application pages across three device breakpoints (mobile, tablet, desktop), creating a comprehensive visual documentation set.

## Prerequisites

1. **Servers Running**

   ```powershell
   # Terminal 1 - API Server
   cd apps/api
   npm run dev
   # Should be running on http://localhost:3001

   # Terminal 2 - Web Server
   cd apps/web
   npm run dev
   # Should be running on http://localhost:3000
   ```

2. **Test Data Seeded**

   ```powershell
   cd apps/api
   npm run seed
   # Creates test trips, users, bookings
   ```

3. **Playwright Installed**
   ```powershell
   cd apps/e2e
   npm install
   ```

## Quick Start

### Option 1: Generate All Wireframes

```powershell
cd apps/e2e
npm test wireframe-generator.spec.ts
```

**Output:** 39 screenshots in `wireframes/` directory  
**Time:** ~2-3 minutes

### Option 2: Generate Specific Pages

```powershell
# Only public pages (no auth)
npm test wireframe-generator.spec.ts -- --grep "Landing|Trips-List|Login|Signup"

# Only admin pages
npm test wireframe-generator.spec.ts -- --grep "Admin"

# Only mobile breakpoint
npm test wireframe-generator.spec.ts -- --grep "Mobile"
```

## Output Structure

```
wireframes/
├── README.md
├── Landing-Mobile.png
├── Landing-Tablet.png
├── Landing-Desktop.png
├── Trips-List-Mobile.png
├── Trips-List-Tablet.png
├── Trips-List-Desktop.png
├── Trip-Detail-Mobile.png
├── Trip-Detail-Tablet.png
├── Trip-Detail-Desktop.png
├── Login-Mobile.png
├── Login-Tablet.png
├── Login-Desktop.png
├── Signup-Mobile.png
├── Signup-Tablet.png
├── Signup-Desktop.png
├── Dashboard-Mobile.png
├── Dashboard-Tablet.png
├── Dashboard-Desktop.png
├── My-Bookings-Mobile.png
├── My-Bookings-Tablet.png
├── My-Bookings-Desktop.png
├── My-Blogs-Mobile.png
├── My-Blogs-Tablet.png
├── My-Blogs-Desktop.png
├── Admin-Dashboard-Mobile.png
├── Admin-Dashboard-Tablet.png
├── Admin-Dashboard-Desktop.png
├── Admin-Bookings-Mobile.png
├── Admin-Bookings-Tablet.png
├── Admin-Bookings-Desktop.png
├── Admin-Analytics-Mobile.png
├── Admin-Analytics-Tablet.png
├── Admin-Analytics-Desktop.png
├── Admin-Trips-Mobile.png
├── Admin-Trips-Tablet.png
├── Admin-Trips-Desktop.png
├── Admin-Users-Mobile.png
├── Admin-Users-Tablet.png
└── Admin-Users-Desktop.png
```

## Adding More Pages

Edit `apps/e2e/tests/wireframe-generator.spec.ts`:

```typescript
const pages = [
  // Add new pages here
  { name: "Page-Name", url: "/page-path", requiresAuth: false },
  { name: "Protected-Page", url: "/protected", requiresAuth: true },
];
```

## Customizing Breakpoints

Edit `apps/e2e/tests/wireframe-generator.spec.ts`:

```typescript
const breakpoints = [
  { name: "iPhone-SE", width: 375, height: 667 },
  { name: "iPad-Pro", width: 1024, height: 1366 },
  { name: "4K", width: 3840, height: 2160 },
];
```

## Post-Processing

### 1. Import to Figma

1. Create new Figma file
2. Drag all PNG files into Figma
3. Organize by breakpoint (3 frames per page)
4. Add annotations using Figma's annotation tools

### 2. Create PDF Documentation

**Windows PowerShell:**

```powershell
# Install ImageMagick (if not already installed)
# winget install ImageMagick.ImageMagick

# Combine all mobile screenshots into PDF
magick convert wireframes/*-Mobile.png wireframes/Mobile-Wireframes.pdf

# Combine all desktop screenshots
magick convert wireframes/*-Desktop.png wireframes/Desktop-Wireframes.pdf
```

### 3. Convert to Grayscale (Wireframe Style)

```powershell
# Install Sharp CLI
npm install -g sharp-cli

# Convert all PNGs to grayscale
Get-ChildItem wireframes/*.png | ForEach-Object {
    sharp grayscale $_.FullName --output "wireframes/bw/$($_.Name)"
}
```

## Troubleshooting

### Issue: Tests Fail with Timeout

**Solution:** Increase timeout in `wireframe-generator.spec.ts`:

```typescript
await page.goto(url, {
  waitUntil: "networkidle",
  timeout: 60000, // Increase to 60 seconds
});
```

### Issue: Login Fails for Admin Pages

**Solution:** Verify test user exists:

```powershell
cd apps/api
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@test.com' } })
  .then(user => console.log(user ? '✅ Admin user exists' : '❌ Run npm run seed'))
  .finally(() => prisma.\$disconnect());
"
```

### Issue: Screenshots Are Blank

**Solution:** Check if servers are running:

```powershell
# Check API
curl http://localhost:3001/health

# Check Web
curl http://localhost:3000
```

### Issue: Missing Trip Detail Page

**Solution:** Verify test trip exists:

```powershell
cd apps/api
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trip.findFirst({ where: { slug: 'manali-adventure' } })
  .then(trip => console.log(trip ? '✅ Trip exists' : '❌ Update slug in wireframe-generator.spec.ts'))
  .finally(() => prisma.\$disconnect());
"
```

## Advanced Options

### Capture Hover States

```typescript
// Before screenshot
await page.hover("button.cta-button");
await page.waitForTimeout(500);
await page.screenshot({ path: "hover-state.png" });
```

### Capture Modal States

```typescript
// Trigger modal
await page.click('button[data-modal="booking"]');
await page.waitForSelector('[role="dialog"]');
await page.screenshot({ path: "booking-modal.png" });
```

### Capture Error States

```typescript
// Submit invalid form
await page.fill('input[type="email"]', "invalid-email");
await page.click('button[type="submit"]');
await page.waitForSelector(".error-message");
await page.screenshot({ path: "error-state.png" });
```

## Best Practices

1. **Run on Clean Database State**
   - Seed fresh data before generation
   - Ensures consistent screenshots

2. **Disable Animations (Optional)**

   ```typescript
   await page.emulateMedia({ reducedMotion: "reduce" });
   ```

3. **Use Consistent Test Data**
   - Same trips, bookings, users
   - Makes screenshots comparable over time

4. **Version Control**
   - Add `wireframes/` to `.gitignore` (large files)
   - Or commit only key reference screenshots

## Integration with Documentation

### 1. Add to README.md

```markdown
## Application Screenshots

See [wireframes/](wireframes/) for comprehensive page documentation.
```

### 2. Add to Design Docs

```markdown
## UI Design Reference

- [Mobile Wireframes](wireframes/Mobile-Wireframes.pdf)
- [Desktop Wireframes](wireframes/Desktop-Wireframes.pdf)
```

### 3. Add to PRE_DEPLOYMENT_CHECKLIST.md

```markdown
- [ ] Verify UI matches wireframes
- [ ] Test responsive layouts
- [ ] Compare production screenshots with wireframes
```

## Automation

### GitHub Actions (Optional)

Create `.github/workflows/wireframes.yml`:

```yaml
name: Generate Wireframes

on:
  push:
    branches: [main]
    paths:
      - "apps/web/src/**"

jobs:
  wireframes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run dev &
      - run: npm test wireframe-generator.spec.ts
      - uses: actions/upload-artifact@v3
        with:
          name: wireframes
          path: wireframes/
```

## Estimated Time

| Task                    | Duration        |
| ----------------------- | --------------- |
| Setup (first time)      | 5 minutes       |
| Generate all wireframes | 2-3 minutes     |
| Import to Figma         | 10 minutes      |
| Add annotations         | 30 minutes      |
| Export PDF              | 5 minutes       |
| **Total**               | **~50 minutes** |

## Next Steps

1. ✅ Run wireframe generation
2. ✅ Review output in `wireframes/` directory
3. ⏭️ Import to Figma for annotation
4. ⏭️ Share with stakeholders
5. ⏭️ Update design documentation

---

**Last Updated:** January 17, 2026  
**Script Location:** `apps/e2e/tests/wireframe-generator.spec.ts`  
**Output Directory:** `wireframes/`
