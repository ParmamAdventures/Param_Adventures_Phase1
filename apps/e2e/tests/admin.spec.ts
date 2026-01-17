import { test, expect } from "@playwright/test";

test.describe("Admin Operations", () => {
  test.slow(); // Increase timeout

  // Use seeded SUPER_ADMIN credentials from apps/api/prisma/seed.js
  const adminCredentials = {
    email: "admin@paramadventures.com",
    password: "password123",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      adminCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', adminCredentials.password);
    await page.click('button:has-text("Sign In")');

    // Check if we reached the dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Navigate straight to admin area to verify access
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  });

  test("should create a new trip as admin", async ({ page }) => {
    // Navigate to create trip
    await page.goto("/admin/trips/new");

    const timestamp = Date.now();
    const tripName = `E2E Trip ${timestamp}`;
    const tripSlug = `e2e-trip-${timestamp}`;

    // --- Overview Tab ---
    await page.fill('input[placeholder="e.g. Kedarkantha Trek"]', tripName);
    await page.fill('input[placeholder="kedarkantha-trek"]', tripSlug);

    // Select Category: Trekking
    // Click Trigger
    await page.locator('label:has-text("Category") ~ div button').click();
    // Click Option (in the absolute positioned dropdown)
    await page.locator('.absolute button:has-text("Trekking")').click();

    // Select Difficulty: Moderate
    await page.locator('label:has-text("Difficulty") ~ div button').click();
    await page.locator('.absolute button:has-text("Moderate")').click();

    // Click outside to close any open dropdowns
    await page.click("h1"); // Click header to be safe

    // Capacity
    await page.locator('label:has-text("Max Capacity") ~ input').fill("15");

    // Description
    await page.fill(
      'textarea[placeholder="Brief overview of the entire journey..."]',
      "An epic E2E adventure creation test."
    );

    // --- Itinerary Tab ---
    await page.waitForTimeout(500);
    await page.click('button:has-text("Itinerary")', { force: true });

    await expect(
      page.getByText("Itinerary PDF", { exact: false }).first()
    ).toBeVisible();

    // --- Logistics Tab ---
    await page.waitForTimeout(500);
    await page.click('button:has-text("Logistics")', { force: true });
    await expect(page.locator('label:has-text("Start Point")')).toBeVisible();

    await page
      .locator('label:has-text("Start Point") ~ input')
      .fill("Base Camp");
    await page.locator('label:has-text("End Point") ~ input').fill("Summit");

    // Location / Region
    await page
      .locator('label:has-text("Region / Location") ~ input')
      .fill("Himalayas");

    // Price
    await page.locator('label:has-text("Price (₹)") ~ input').fill("15000");

    // Dates (Optional in form but good to fill)
    const today = new Date().toISOString().split("T")[0];
    await page.getByPlaceholder("dd/mm/yyyy").first().fill(today);
    await page.getByPlaceholder("dd/mm/yyyy").nth(1).fill(today);

    // --- Launch ---
    await page.click('button:has-text("Launch Adventure")');

    // Should redirect back to list and show the new trip
    await expect(page).toHaveURL(/\/admin\/trips/);

    // Search or find the trip in the list
    // The list might be paginated or long, but let's check visibility
    await expect(page.locator(`text=${tripName}`)).toBeVisible();
  });

  test("should manage user status", async ({ page, browser }) => {
    // 1. Create a regular user to be suspended
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const targetEmail = `suspend-target-${Date.now()}@example.com`;

    await userPage.goto("/signup");
    await userPage.fill('input[placeholder="John Doe"]', "Target User");
    await userPage.fill('input[placeholder="name@example.com"]', targetEmail);
    await userPage.fill(
      'input[placeholder="Create a strong password"]',
      "Password123!"
    );
    await userPage.click('button:has-text("Create Account")');
    await expect(userPage.locator("text=Welcome Aboard!")).toBeVisible();
    await userContext.close();

    // 2. Login as Admin (using the main test page)
    // (Already logged in via beforeEach)

    // 3. Go to Users management
    await page.goto("/admin/users");

    // Wait for user table
    await page.waitForSelector("table");

    // 4. Find an existing user row and suspend via action button
    const userRows = page.locator("tbody tr");
    const firstUserRow = userRows.first();
    await expect(firstUserRow).toBeVisible();

    // 5. Change status to SUSPENDED using the Suspend button
    page.once("dialog", (dialog) => dialog.accept());
    const suspendBtn = firstUserRow
      .locator("button")
      .filter({ hasText: /Suspend/i });

    if (await suspendBtn.isVisible()) {
      await suspendBtn.click();
    }
  });
});
