import { test, expect } from "@playwright/test";

test.describe("Trip Booking Flow", () => {
  const credentials = {
    email: `e2e-trips-${Date.now()}@example.com`,
    password: "Password123!",
    name: "E2E Trips User",
  };

  test.beforeAll(async ({ browser }) => {
    // Create the user once for these tests via registration UI
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/signup");
    await page.fill('input[placeholder="John Doe"]', credentials.name);
    await page.fill('input[placeholder="name@example.com"]', credentials.email);
    await page.fill(
      'input[placeholder="Create a strong password"]',
      credentials.password
    );
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector("text=Welcome Aboard!", { timeout: 15000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="name@example.com"]', credentials.email);
    await page.fill('input[placeholder="••••••••"]', credentials.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should find and book a trip", async ({ page }) => {
    // 2. Go to trips
    await page.goto("/trips");

    // Wait for the main grid container
    await page.waitForSelector(".grid.gap-6", { timeout: 10000 });

    // 3. Find and click first trip
    const firstTripLink = page.locator('a[href^="/trips/"]').first();
    await firstTripLink.click();

    // 4. Book Trip
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("button", { name: "Join Trip" }).click();
    await expect(
      page.getByText("Book Adventure", { exact: false })
    ).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    await page.locator('input[type="date"]').fill(dateString);

    // Fill required guest details
    await page.getByPlaceholder("Full Name").fill("E2E Trips User");
    await page.getByPlaceholder("Email").fill(credentials.email);
    await page.getByPlaceholder("Phone").fill("1234567890");
    await page.getByPlaceholder("Age").fill("30");
    await page.locator("select").selectOption("Male");

    await page.getByRole("button", { name: "+" }).click(); // Increase guests to 2

    await page.getByRole("button", { name: "Confirm & Pay" }).click();

    // 5. Verify Success
    await expect(
      page.getByText("Booking & Payment Successful", { exact: false })
    ).toBeVisible();
  });
});
