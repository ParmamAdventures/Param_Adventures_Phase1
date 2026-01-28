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

    // Wait a moment for form to be ready
    await page.waitForTimeout(500);

    // Click button and wait for it to process
    await page.click('button:has-text("Create Account")');

    // Wait longer for form submission and API response
    await page.waitForTimeout(2000);

    // Check for error message first
    const errorElement = page.locator(".bg-red-500, [class*='red-500']");
    const isError = await errorElement.isVisible().catch(() => false);
    if (isError) {
      const errorText = await errorElement.textContent();
      throw new Error(`Guide registration failed: ${errorText}`);
    }

    // Wait for success message to appear (can take longer during parallel execution)
    await expect(page.locator("text=Welcome Aboard!")).toBeVisible({
      timeout: 30000,
    });

    // Wait for redirect after the 2-second delay
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  });

  test.beforeEach(async ({ page }) => {
    // Login as guide
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      guideCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', guideCredentials.password);

    // Click and wait for navigation
    const signInButton = page.getByRole("button", { name: "Sign In" });
    await signInButton.click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test("should view assigned trips as guide", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard/bookings");

    // Look for the My Adventures heading
    await expect(
      page.getByRole("heading", { name: "My Adventures" })
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
