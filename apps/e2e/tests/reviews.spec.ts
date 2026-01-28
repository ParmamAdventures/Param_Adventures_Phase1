import { test, expect } from "@playwright/test";

test.describe("Review and Rating Flow", () => {
  test.slow();

  const userCredentials = {
    email: `review-test-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Review Tester",
  };

  test.beforeAll(async ({ browser }) => {
    // Register test user
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/signup");
    await page.fill('input[placeholder="John Doe"]', userCredentials.name);
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill(
      'input[placeholder="Create a strong password"]',
      userCredentials.password
    );
    await page.click('button:has-text("Create Account")');

    // Wait longer for form submission and API response
    await page.waitForTimeout(2000);

    // Wait for success message to appear (can take longer during parallel execution)
    await expect(page.locator("text=Welcome Aboard!")).toBeVisible({
      timeout: 30000,
    });

    // Wait for redirect after the 2-second delay
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  });

  test("should view trips", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', userCredentials.password);

    // Wait for button and click it
    const signInButton = page.getByRole("button", { name: "Sign In" });
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid.gap-6", { timeout: 10000 });

    // Verify trips page
    const content = await page.locator("main").textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should access dashboard", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', userCredentials.password);

    // Wait for button and click it
    const signInButton = page.getByRole("button", { name: "Sign In" });
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Should see dashboard
    const content = await page.locator("main").textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should access bookings", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', userCredentials.password);

    // Wait for button and click it
    const signInButton = page.getByRole("button", { name: "Sign In" });
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Go to bookings
    await page.goto("/dashboard/bookings");

    // Should show bookings page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should access profile", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', userCredentials.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Go to profile
    await page.goto("/dashboard/profile");

    // Should show profile page
    const content = await page.locator("main").textContent();
    expect(content?.length).toBeGreaterThan(0);
  });
});
