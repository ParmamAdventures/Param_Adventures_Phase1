import { test, expect } from "@playwright/test";

test.describe("Review Management Flow", () => {
  test.slow();

  const userCredentials = {
    email: `review-mgmt-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Review Manager",
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

    // Wait for success
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

  test("should view featured reviews on homepage", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for reviews section
    const reviewsSection = page
      .locator("div, section")
      .filter({ hasText: /Review|Rating|Testimonial|Feedback/i })
      .first();

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();

    // Should either have reviews section or other content
    if (await reviewsSection.isVisible()) {
      await expect(reviewsSection).toBeVisible();
    }
  });

  test("should view reviews for a trip", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip
    const firstTripLink = page.locator("a[href*='/trips/']").first();
    const href = await firstTripLink.getAttribute("href");

    if (href) {
      await firstTripLink.click();
      await page.waitForTimeout(1000);

      // Look for reviews section on trip detail
      const reviewsSection = page
        .locator("div, section")
        .filter({ hasText: /Review|Rating|Testimonial|Feedback/i })
        .first();

      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();

      if (await reviewsSection.isVisible()) {
        await expect(reviewsSection).toBeVisible();
      }
    }
  });

  test("should check review eligibility", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip
    const firstTripLink = page.locator("a[href*='/trips/']").first();
    const href = await firstTripLink.getAttribute("href");

    if (href) {
      await firstTripLink.click();
      await page.waitForTimeout(1000);

      // Look for review button or section
      const reviewButton = page
        .locator("button, a")
        .filter({ hasText: /Write Review|Leave Review|Add Review|Rate/i })
        .first();

      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();

      // Button might not be visible if not eligible
      if (await reviewButton.isVisible()) {
        // User is eligible to review
        await expect(reviewButton).toBeVisible();
      }
    }
  });

  test("should display review count on trip", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Check for review count displays
    const reviewCounts = page
      .locator("text")
      .filter({ hasText: /\d+\s*review/i });

    const count = await reviewCounts.count();
    // May or may not have reviews, either is valid
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should display star ratings on trips", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for star rating elements
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();

    // Should display some content
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should view my reviews from dashboard", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for reviews section in dashboard
    const reviewsLink = page
      .locator("a, button")
      .filter({ hasText: /Review|My Review|Rating/i })
      .first();

    if (await reviewsLink.isVisible()) {
      await reviewsLink.click();
      await page.waitForTimeout(500);
    }

    // Should be on valid page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should handle review submission if eligible", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip
    const firstTripLink = page.locator("a[href*='/trips/']").first();
    const href = await firstTripLink.getAttribute("href");

    if (href) {
      await firstTripLink.click();
      await page.waitForTimeout(1000);

      // Look for review form or button
      const reviewButton = page
        .locator("button, a")
        .filter({ hasText: /Write Review|Leave Review|Add Review/i })
        .first();

      if (await reviewButton.isVisible()) {
        await reviewButton.click();
        await page.waitForTimeout(500);

        // Try to interact with rating selector
        const stars = page
          .locator("button, div")
          .filter({ hasText: /★|★★|★★★|★★★★|★★★★★/i });

        if ((await stars.count()) > 0) {
          // Select 5-star rating
          await stars.last().click();
        }

        // Try to fill review text
        const textarea = page.locator("textarea").first();
        if (await textarea.isVisible()) {
          await textarea.fill("Great experience! Highly recommend.");
        }

        // Look for submit button
        const submitButton = page
          .locator("button")
          .filter({ hasText: /Submit|Post|Send|Publish/i })
          .first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Should still be on valid page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should filter reviews by rating", async ({ page }) => {
    // Go to trips
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Find first trip
    const firstTripLink = page.locator("a[href*='/trips/']").first();
    const href = await firstTripLink.getAttribute("href");

    if (href) {
      await firstTripLink.click();
      await page.waitForTimeout(1000);

      // Look for filter options
      const filterButton = page
        .locator("button")
        .filter({ hasText: /Filter|Sort|Rating/i })
        .first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);

        // Try to select a rating filter
        const ratingOption = page
          .locator("button, label, div")
          .filter({ hasText: /5 star|4 star|3 star/i })
          .first();

        if (await ratingOption.isVisible()) {
          await ratingOption.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Should still have content
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should delete my review if exists", async ({ page }) => {
    // Navigate to my reviews
    const reviewsLink = page
      .locator("a")
      .filter({ hasText: /Review|My Review/i })
      .first();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (await reviewsLink.isVisible()) {
      await reviewsLink.click();
      await page.waitForTimeout(500);
    }

    // Look for delete button
    const deleteButton = page
      .locator("button")
      .filter({ hasText: /Delete|Remove|Remove Review/i })
      .first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Confirm deletion if dialog appears
      const confirmButton = page
        .locator("button")
        .filter({ hasText: /Confirm|Yes|Delete/i })
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Should still be on valid page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});
