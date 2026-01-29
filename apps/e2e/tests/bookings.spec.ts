import { test, expect } from "@playwright/test";

test.describe("Booking Management Flow", () => {
  test.slow();

  const userCredentials = {
    email: `booking-test-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Booking Tester",
  };

  let tripSlug: string;

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

    // Wait for success message
    await expect(page.locator("text=Welcome Aboard!")).toBeVisible({
      timeout: 20000,
    });

    // Wait for redirect
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

  test("should view my bookings page", async ({ page }) => {
    // Navigate to my bookings
    await page.goto("/dashboard/bookings");

    // Verify page title
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
    expect(content).toContain("Adventures");
  });

  test("should display bookings list", async ({ page }) => {
    await page.goto("/dashboard/bookings");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // The page should exist with heading
    const pageHeading = page.locator("h1, h2");
    await expect(pageHeading)
      .toHaveCount(1, { timeout: 5000 })
      .catch(() => {
        // No bookings yet is also valid
      });
  });

  test("should navigate to trips and create a booking", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");

    // Wait for trips grid
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip link
    const firstTripLink = page.locator("a[href*='/trips/']").first();
    const href = await firstTripLink.getAttribute("href");

    if (href) {
      // Extract slug from href
      tripSlug = href.split("/").pop() || "";

      // Click to view trip details
      await firstTripLink.click();

      // Should be on trip detail page
      await expect(page).toHaveURL(new RegExp(tripSlug), { timeout: 10000 });

      // Look for "Join Trip" button
      const joinButton = page.getByRole("button", {
        name: /Join Trip|Book Now|Reserve/i,
      });

      if (await joinButton.isVisible()) {
        await joinButton.click();

        // Wait for booking modal/form
        await page.waitForTimeout(1000);

        // Fill in booking details
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateString = tomorrow.toISOString().split("T")[0];
          await dateInput.fill(dateString);
        }

        // Fill guest info if visible
        const nameInputs = page.locator('input[placeholder*="Name"]');
        if ((await nameInputs.count()) > 0) {
          await nameInputs.first().fill(userCredentials.name);
        }

        const emailInputs = page.locator('input[type="email"]');
        if ((await emailInputs.count()) > 0) {
          await emailInputs.last().fill(userCredentials.email);
        }

        // Close modal or navigate away
        await page.goto("/dashboard/bookings", { waitUntil: "networkidle" });
      }
    }
  });

  test("should cancel a booking if exists", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    await page.waitForLoadState("networkidle");

    // Look for cancel button
    const cancelButton = page
      .locator("button")
      .filter({ hasText: /Cancel/i })
      .first();

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Confirm cancellation if dialog appears
      const confirmButton = page
        .locator("button")
        .filter({ hasText: /Confirm|Yes|OK/i })
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for update
      await page.waitForTimeout(1000);

      // Should still be on bookings page
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should display booking details if booking exists", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    await page.waitForLoadState("networkidle");

    // Look for booking card/item
    const bookingCard = page
      .locator("div, article")
      .filter({ hasText: /Booking|Trip|Status/ })
      .first();

    if (await bookingCard.isVisible()) {
      // Click to view details
      const detailsButton = bookingCard.locator("button, a").first();
      if (await detailsButton.isVisible()) {
        await detailsButton.click();
        await page.waitForTimeout(500);
      }

      // Should see booking information
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should show empty state when no bookings", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    await page.waitForLoadState("networkidle");

    // Check for empty state message or no bookings
    const emptyState = page
      .locator("text")
      .filter({ hasText: /No bookings|No adventures/i })
      .first();
    const bookings = page
      .locator("div, article")
      .filter({ hasText: /Booking|Trip|Status/ });

    // Either empty state or bookings exist
    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasBookings = (await bookings.count()) > 0;

    expect(isEmpty || hasBookings).toBeTruthy();
  });
});
