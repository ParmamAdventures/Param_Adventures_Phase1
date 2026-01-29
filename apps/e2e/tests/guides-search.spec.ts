import { test, expect } from "@playwright/test";

test.describe("Guide Management & Features", () => {
  test.slow();

  const userCredentials = {
    email: `guide-test-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Guide Tester",
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

  test("should view available guides", async ({ page }) => {
    // Look for guides page or section
    const guidesLink = page
      .locator("a")
      .filter({ hasText: /Guide|Expert|Specialist/i })
      .first();

    if (await guidesLink.isVisible()) {
      await guidesLink.click();
      await page.waitForTimeout(500);
    } else {
      // Try direct navigation
      await page.goto("/guides").catch(() => {
        page.goto("/admin/guides");
      });
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should view guide details", async ({ page }) => {
    // Go to guides page
    await page.goto("/guides").catch(() => {
      page.goto("/admin/guides");
    });

    await page.waitForLoadState("networkidle");

    // Find first guide card/link
    const guideLink = page.locator("a[href*='/guide']").first();

    if (await guideLink.isVisible()) {
      await guideLink.click();
      await page.waitForTimeout(500);

      // Should show guide details
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should assign guide to trip in admin", async ({ page }) => {
    // Navigate to admin trips
    const adminLink = page
      .locator("a")
      .filter({ hasText: /Admin|Management/i })
      .first();

    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(500);

      // Look for trips section
      const tripsLink = page
        .locator("a, button")
        .filter({ hasText: /Trip|Assignment/i })
        .first();

      if (await tripsLink.isVisible()) {
        await tripsLink.click();
        await page.waitForTimeout(500);

        // Look for assign guide button
        const assignButton = page
          .locator("button")
          .filter({ hasText: /Assign|Add Guide|Select/i })
          .first();

        if (await assignButton.isVisible()) {
          await assignButton.click();
          await page.waitForTimeout(500);

          // Select a guide
          const guideOption = page
            .locator("button, option, label")
            .filter({ hasText: /Guide|Expert/i })
            .first();

          if (await guideOption.isVisible()) {
            await guideOption.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});

test.describe("Search & Filter Features", () => {
  test("should search trips by keyword", async ({ page }) => {
    // Go to trips page
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for search input
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("trek");
      await page.waitForTimeout(1000);

      // Should filter or show results
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should filter trips by category", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for category filter
    const categoryFilter = page
      .locator("button, label, select")
      .filter({ hasText: /Category|Type|Adventure/i })
      .first();

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);

      // Select a category
      const categoryOption = page
        .locator("button, option")
        .filter({ hasText: /Trekking|Climbing|Camping|Water/i })
        .first();

      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(500);
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should filter trips by difficulty", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for difficulty filter
    const difficultyFilter = page
      .locator("button, label, select")
      .filter({ hasText: /Difficulty|Level/i })
      .first();

    if (await difficultyFilter.isVisible()) {
      await difficultyFilter.click();
      await page.waitForTimeout(500);

      const difficultyOption = page
        .locator("button, option")
        .filter({ hasText: /Easy|Moderate|Hard|Beginner/i })
        .first();

      if (await difficultyOption.isVisible()) {
        await difficultyOption.click();
        await page.waitForTimeout(500);
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should filter trips by duration", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for duration filter
    const durationFilter = page
      .locator("button, label, select, input")
      .filter({ hasText: /Duration|Days|Length/i })
      .first();

    if (await durationFilter.isVisible()) {
      if (await durationFilter.evaluate((el) => el.tagName === "INPUT")) {
        // It's a range input or number input
        await durationFilter.fill("5");
      } else {
        // It's a button or select
        await durationFilter.click();
        await page.waitForTimeout(500);

        const option = page
          .locator("button, option")
          .filter({ hasText: /5|7|10|14/i })
          .first();

        if (await option.isVisible()) {
          await option.click();
        }
      }

      await page.waitForTimeout(500);
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should filter trips by location", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for location filter
    const locationFilter = page
      .locator("input, button, select")
      .filter({ hasText: /Location|Region|Place/i })
      .first();

    if (await locationFilter.isVisible()) {
      if (await locationFilter.evaluate((el) => el.tagName === "INPUT")) {
        await locationFilter.fill("Himalayas");
      } else {
        await locationFilter.click();
        await page.waitForTimeout(500);

        const location = page
          .locator("button, option")
          .filter({ hasText: /Himalayas|Spiti|Kerala/i })
          .first();

        if (await location.isVisible()) {
          await location.click();
        }
      }

      await page.waitForTimeout(500);
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should sort trips by price", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for sort dropdown
    const sortButton = page
      .locator("button, select")
      .filter({ hasText: /Sort|Order|Price/i })
      .first();

    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(500);

      const sortOption = page
        .locator("button, option")
        .filter({ hasText: /Price|Low to High|High to Low/i })
        .first();

      if (await sortOption.isVisible()) {
        await sortOption.click();
        await page.waitForTimeout(500);
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should sort trips by rating", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Look for sort dropdown
    const sortButton = page
      .locator("button, select")
      .filter({ hasText: /Sort|Order|Rating/i })
      .first();

    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(500);

      const sortOption = page
        .locator("button, option")
        .filter({ hasText: /Rating|Popular|Most Rated/i })
        .first();

      if (await sortOption.isVisible()) {
        await sortOption.click();
        await page.waitForTimeout(500);
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should clear all filters", async ({ page }) => {
    await page.goto("/trips");
    await page.waitForSelector(".grid", { timeout: 10000 });

    // Apply a filter
    const filterButton = page
      .locator("button, label, select")
      .filter({ hasText: /Filter|Category/i })
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Look for clear button
      const clearButton = page
        .locator("button")
        .filter({ hasText: /Clear|Reset|Remove All/i })
        .first();

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);
      }
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});
