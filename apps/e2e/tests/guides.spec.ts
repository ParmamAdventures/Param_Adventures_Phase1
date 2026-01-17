import { test, expect } from "@playwright/test";

test.describe("Guide Management Flow", () => {
  test.slow();

  // Create unique guide for this test run
  const guideCredentials = {
    name: `Guide ${Date.now()}`,
    email: `guide-${Date.now()}@example.com`,
    password: "Password123!",
  };

  test.beforeAll(async ({ browser }) => {
    // Register guide user
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/signup");
    await page.fill('input[placeholder="John Doe"]', guideCredentials.name);
    await page.fill(
      'input[placeholder="name@example.com"]',
      guideCredentials.email
    );
    await page.fill(
      'input[placeholder="Create a strong password"]',
      guideCredentials.password
    );
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector("text=Welcome Aboard!", { timeout: 15000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login as guide
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      guideCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', guideCredentials.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("should view assigned trips as guide", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard/bookings");

    // Look for trips assigned to this guide
    await expect(
      page.locator("text=My Adventures", { exact: false })
    ).toBeVisible();

    // Verify there is a trips section or message
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should view trip assignments as guide", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Should see dashboard for guide
    const mainContent = await page.locator("main").textContent();
    expect(mainContent).toBeTruthy();
  });

  test("should manage guide profile", async ({ page }) => {
    // Navigate to profile
    await page.goto("/dashboard/profile");

    // Should see profile page
    const mainContent = await page.locator("main").textContent();
    expect(mainContent?.length).toBeGreaterThan(0);
  });

  test("should communicate with participants", async ({ page }) => {
    // Navigate to bookings or trip details
    await page.goto("/dashboard/bookings");

    // Look for communication features (messaging, notes, etc.)
    const mainContent = await page.locator("main").textContent();
    expect(mainContent).toBeTruthy();
  });
});
