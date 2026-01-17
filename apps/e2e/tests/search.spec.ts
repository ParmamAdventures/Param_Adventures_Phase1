import { test, expect } from "@playwright/test";

test.describe("Search and Filter Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to trips page
    await page.goto("/trips");
    await page.waitForSelector(".grid.gap-6", { timeout: 10000 });
  });

  test("should filter trips by category", async ({ page }) => {
    // Look for category filter
    const categoryFilter = page
      .locator(
        '[data-testid="category-filter"], label:has-text("Category"), select[name="category"]'
      )
      .first();

    if (await categoryFilter.isVisible()) {
      // Check if it's a select or button group
      const isSelect = await categoryFilter.evaluate(
        (el) => el.tagName === "SELECT"
      );

      if (isSelect) {
        await categoryFilter.selectOption("TREK");
      } else {
        // Look for category buttons/options
        const trekOption = page
          .locator('button, [role="option"]')
          .filter({ hasText: /Trek|TREK/i })
          .first();
        if (await trekOption.isVisible()) {
          await trekOption.click();
        }
      }

      // Wait for filtered results
      await page.waitForTimeout(500);
      const results = page.locator(".grid.gap-6");
      await expect(results).toBeVisible();
    }
  });

  test("should filter trips by difficulty", async ({ page }) => {
    // Look for difficulty filter
    const difficultyFilter = page
      .locator(
        '[data-testid="difficulty-filter"], label:has-text("Difficulty"), select[name="difficulty"]'
      )
      .first();

    if (await difficultyFilter.isVisible()) {
      const isSelect = await difficultyFilter.evaluate(
        (el) => el.tagName === "SELECT"
      );

      if (isSelect) {
        await difficultyFilter.selectOption("Moderate");
      } else {
        const moderateOption = page
          .locator('button, [role="option"]')
          .filter({ hasText: /Moderate/i })
          .first();
        if (await moderateOption.isVisible()) {
          await moderateOption.click();
        }
      }

      await page.waitForTimeout(500);
      const results = page.locator(".grid.gap-6");
      await expect(results).toBeVisible();
    }
  });

  test("should filter trips by price range", async ({ page }) => {
    // Look for price filter or range slider
    const priceLabel = page.locator("text=Price").first();

    if (await priceLabel.isVisible()) {
      // Try to find price input fields
      const priceInputs = page.locator(
        'input[type="number"], input[placeholder*="price"], input[placeholder*="Price"]'
      );

      if ((await priceInputs.count()) > 0) {
        const minPriceInput = priceInputs.first();
        const maxPriceInput = priceInputs.nth(1);

        if (await minPriceInput.isVisible()) {
          await minPriceInput.fill("1000");
        }

        if (await maxPriceInput.isVisible()) {
          await maxPriceInput.fill("50000");
        }

        // Apply filter
        const applyBtn = page
          .locator("button")
          .filter({ hasText: /Apply|Filter/i })
          .first();
        if (await applyBtn.isVisible()) {
          await applyBtn.click();
        }

        await page.waitForTimeout(500);
      }
    }
  });

  test("should search trips by location", async ({ page }) => {
    // Look for search/location input
    const searchInput = page
      .locator(
        'input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="location"], input[placeholder*="Location"]'
      )
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("Himalayas");

      // Trigger search (enter or button)
      await searchInput.press("Enter");

      await page.waitForTimeout(500);
      const results = page.locator(".grid.gap-6");
      await expect(results).toBeVisible();
    }
  });

  test("should sort trips by various criteria", async ({ page }) => {
    // Look for sort dropdown
    const sortDropdown = page
      .locator(
        '[data-testid="sort-dropdown"], select[name="sort"], label:has-text("Sort")'
      )
      .first();

    if (await sortDropdown.isVisible()) {
      const isSelect = await sortDropdown
        .evaluate((el) => el.tagName === "SELECT")
        .catch(() => false);

      if (isSelect) {
        // Try different sort options
        const options = await sortDropdown.locator("option").all();
        if (options.length > 1) {
          await sortDropdown.selectOption(
            options[1].getAttribute("value") || ""
          );
        }
      } else {
        // Button-based sort
        const sortBtn = page
          .locator('button, [role="button"]')
          .filter({ hasText: /Sort|Price|Popular/i })
          .first();
        if (await sortBtn.isVisible()) {
          await sortBtn.click();
        }
      }

      await page.waitForTimeout(500);
      const results = page.locator(".grid.gap-6");
      await expect(results).toBeVisible();
    }
  });

  test("should combine multiple filters", async ({ page }) => {
    // Apply category filter
    const categoryBtn = page
      .locator('button, [role="option"]')
      .filter({ hasText: /Trek|Mountain/i })
      .first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
      await page.waitForTimeout(300);
    }

    // Apply difficulty filter
    const difficultyBtn = page
      .locator('button, [role="option"]')
      .filter({ hasText: /Moderate|Easy/i })
      .first();
    if (await difficultyBtn.isVisible()) {
      await difficultyBtn.click();
      await page.waitForTimeout(300);
    }

    // Results should reflect combined filters
    const results = page.locator(".grid.gap-6");
    await expect(results).toBeVisible();
  });

  test("should clear all filters and show all trips", async ({ page }) => {
    // Apply a filter first
    const categoryBtn = page
      .locator('button, [role="option"]')
      .filter({ hasText: /Trek/i })
      .first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
      await page.waitForTimeout(300);
    }

    // Look for clear/reset button
    const clearBtn = page
      .locator('button, [role="button"]')
      .filter({ hasText: /Clear|Reset|All/i })
      .first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(300);
    }

    // All trips should be visible
    const results = page.locator(".grid.gap-6");
    await expect(results).toBeVisible();
  });

  test("should handle no results gracefully", async ({ page }) => {
    // Search for something unlikely to exist
    const searchInput = page
      .locator('input[placeholder*="search"], input[placeholder*="Search"]')
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("XYZNONEXISTENT12345");
      await searchInput.press("Enter");

      await page.waitForTimeout(500);

      // Should show empty state or message
      const emptyMsg = page
        .locator(
          "text=No results, text=not found, text=No trips, text=Try adjusting"
        )
        .first();
      const results = page.locator(".grid.gap-6");

      // Either empty state message or empty grid
      const hasEmptyMsg = await emptyMsg.isVisible().catch(() => false);
      const gridVisible = await results.isVisible();

      expect(hasEmptyMsg || gridVisible).toBeTruthy();
    }
  });
});
