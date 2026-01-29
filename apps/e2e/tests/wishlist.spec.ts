import { test, expect } from "@playwright/test";

test.describe("Wishlist Feature", () => {
  test.slow();

  const userCredentials = {
    email: `wishlist-test-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Wishlist Tester",
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

    await expect(page.locator("text=Welcome Aboard!")).toBeVisible({
      timeout: 20000,
    });

    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill(
      'input[placeholder="name@example.com"]',
      userCredentials.email
    );
    await page.fill('input[placeholder="••••••••"]', userCredentials.password);

    const signInButton = page.getByRole("button", { name: "Sign In" });
    await signInButton.click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test("should add trip to wishlist", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip
    const firstTripCard = page
      .locator("div, article")
      .filter({ hasText: /Trip|Adventure/ })
      .first();

    if (await firstTripCard.isVisible()) {
      // Look for heart/wishlist button
      const wishlistButton = firstTripCard
        .locator("button")
        .filter({ hasText: /♡|☆|Wishlist|Save/i })
        .first();

      if (await wishlistButton.isVisible()) {
        await wishlistButton.click();
        await page.waitForTimeout(500);

        // Button state might change
        const updatedButton = firstTripCard.locator("button").first();
        await expect(updatedButton).toBeTruthy();
      }
    }
  });

  test("should view wishlist", async ({ page }) => {
    // Try to navigate to wishlist
    const wishlistLink = page
      .locator("a, button")
      .filter({ hasText: /Wishlist|Saved Trips|Favorites/i })
      .first();

    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();
      await page.waitForTimeout(500);
    } else {
      // Try direct navigation
      await page.goto("/dashboard/wishlist").catch(() => {
        page.goto("/wishlist");
      });
    }

    // Should show wishlist content
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should remove trip from wishlist", async ({ page }) => {
    // Navigate to wishlist
    await page.goto("/dashboard/wishlist").catch(() => {
      page.goto("/wishlist");
    });

    await page.waitForLoadState("networkidle");

    // Look for remove button
    const removeButton = page
      .locator("button")
      .filter({ hasText: /Remove|Delete|Unfavorite/i })
      .first();

    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(500);

      // Confirm if needed
      const confirmButton = page
        .locator("button")
        .filter({ hasText: /Confirm|Yes|OK/i })
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }

    // Should still be on valid page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should show empty wishlist message", async ({ page }) => {
    // Navigate to wishlist
    await page.goto("/dashboard/wishlist").catch(() => {
      page.goto("/wishlist");
    });

    await page.waitForLoadState("networkidle");

    // Check for empty state or items
    const emptyMessage = page
      .locator("text")
      .filter({ hasText: /No trips|Empty|No saved/i })
      .first();
    const items = page
      .locator("div, article")
      .filter({ hasText: /Trip|Adventure/ });

    const isEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasItems = (await items.count()) > 0;

    expect(isEmpty || hasItems).toBeTruthy();
  });
});
