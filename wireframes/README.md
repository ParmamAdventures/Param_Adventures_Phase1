# Param Adventures - Wireframes

This directory contains automatically generated wireframes/screenshots of all application pages across different device breakpoints.

## Generation Date

Generated: January 17, 2026

## Coverage

### Pages Captured (13 pages × 3 breakpoints = 39 screenshots)

**Public Pages:**

- Landing page
- Trips list
- Trip detail
- Login
- Signup

**Authenticated User Pages:**

- Dashboard
- My Bookings
- My Blogs

**Admin Pages:**

- Admin Dashboard
- Admin Bookings
- Admin Analytics
- Admin Trips
- Admin Users

### Breakpoints

- **Mobile**: 375×812 (iPhone X)
- **Tablet**: 768×1024 (iPad)
- **Desktop**: 1920×1080 (Full HD)

## File Naming Convention

```
{PageName}-{Breakpoint}.png
```

Examples:

- `Landing-Mobile.png`
- `Trips-List-Tablet.png`
- `Admin-Dashboard-Desktop.png`

## How to Regenerate

1. Ensure API and Web servers are running:

   ```powershell
   # Terminal 1 - API Server
   cd apps/api
   npm run dev

   # Terminal 2 - Web Server
   cd apps/web
   npm run dev
   ```

2. Run the wireframe generator:

   ```powershell
   cd apps/e2e
   npm test wireframe-generator.spec.ts
   ```

3. Screenshots will be saved to `wireframes/` directory

## Usage

These wireframes can be:

- Imported into Figma/Miro for annotation
- Used in documentation
- Shared with stakeholders
- Included in design specs
- Used for UI/UX reviews

## Next Steps

1. Import screenshots into Figma
2. Add interaction annotations (arrows, labels)
3. Document user flows
4. Create clickable prototype (optional)
5. Export as PDF for stakeholder review
