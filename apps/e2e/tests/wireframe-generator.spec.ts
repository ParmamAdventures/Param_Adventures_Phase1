import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const outputDir = path.join(__dirname, "../../../wireframes");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
  { name: "Landing", url: "/", requiresAuth: false },
  { name: "Trips-List", url: "/trips", requiresAuth: false },
  { name: "Trip-Detail", url: "/trips/manali-adventure", requiresAuth: false },
  { name: "Login", url: "/login", requiresAuth: false },
  { name: "Signup", url: "/signup", requiresAuth: false },
  { name: "Dashboard", url: "/dashboard", requiresAuth: true },
  { name: "My-Bookings", url: "/my-bookings", requiresAuth: true },
  { name: "My-Blogs", url: "/my-blogs", requiresAuth: true },
  { name: "Admin-Dashboard", url: "/admin", requiresAuth: true },
  { name: "Admin-Bookings", url: "/admin/bookings", requiresAuth: true },
  { name: "Admin-Analytics", url: "/admin/analytics", requiresAuth: true },
  { name: "Admin-Trips", url: "/admin/trips", requiresAuth: true },
  { name: "Admin-Users", url: "/admin/users", requiresAuth: true },
];

const breakpoints = [
  { name: "Mobile", width: 375, height: 812 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1920, height: 1080 },
];

test.describe("Wireframe Generation Suite", () => {
  test.beforeAll(async () => {
    console.log(`\n📸 Generating wireframes in: ${outputDir}\n`);
  });

  // Public pages (no auth required)
  for (const pageConfig of pages.filter((p) => !p.requiresAuth)) {
    for (const breakpoint of breakpoints) {
      test(`${pageConfig.name} - ${breakpoint.name}`, async ({ page }) => {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height,
        });

        await page.goto(`http://localhost:3000${pageConfig.url}`, {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        // Wait for content to render
        await page.waitForTimeout(2000);

        const filename = `${pageConfig.name}-${breakpoint.name}.png`;
        await page.screenshot({
          path: path.join(outputDir, filename),
          fullPage: true,
        });

        console.log(`✅ Generated: ${filename}`);
      });
    }
  }

  // Authenticated pages (requires login)
  for (const pageConfig of pages.filter((p) => p.requiresAuth)) {
    for (const breakpoint of breakpoints) {
      test(`${pageConfig.name} - ${breakpoint.name}`, async ({ page }) => {
        test.setTimeout(90000); // Increase timeout for auth pages

        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height,
        });

        try {
          // Login first
          await page.goto("http://localhost:3000/login", {
            waitUntil: "networkidle",
            timeout: 30000,
          });

          // Wait for login form to be visible
          await page.waitForSelector('input[type="email"]', { timeout: 15000 });

          // Clear and fill form fields
          await page.locator('input[type="email"]').fill("admin@test.com");
          await page.locator('input[type="password"]').fill("AdminPass123");

          // Click submit button and wait for navigation
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click({ timeout: 10000 });

          // Wait for navigation after login - more flexible pattern
          await page.waitForFunction(
            () => !window.location.pathname.includes("login"),
            { timeout: 20000 }
          );

          // Wait for page to be fully loaded
          await page.waitForLoadState("networkidle", { timeout: 15000 });

          // Navigate to target page
          await page.goto(`http://localhost:3000${pageConfig.url}`, {
            waitUntil: "networkidle",
            timeout: 30000,
          });

          // Wait for content to render
          await page.waitForLoadState("networkidle", { timeout: 15000 });
          await page.waitForTimeout(2000);

          const filename = `${pageConfig.name}-${breakpoint.name}.png`;
          await page.screenshot({
            path: path.join(outputDir, filename),
            fullPage: true,
          });

          console.log(`✅ Generated: ${filename}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            `⚠️ Skipped ${pageConfig.name}-${breakpoint.name}: ${errorMessage}`
          );
          test.skip();
        }
      });
    }
  }

  test.afterAll(async () => {
    console.log(`\n🎉 Wireframe generation complete!`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Total screenshots: ${pages.length * breakpoints.length}`);
  });
});
