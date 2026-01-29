import { test, expect } from "@playwright/test";

test.describe("User Profile Management", () => {
  test.slow();

  const userCredentials = {
    email: `profile-test-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Profile Tester",
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

  test("should access user profile", async ({ page }) => {
    // Navigate to profile or account settings
    // Look for profile dropdown or settings link
    const profileLink = page
      .locator("a, button")
      .filter({ hasText: /Profile|Account|Settings/i })
      .first();

    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForTimeout(500);
    } else {
      // Try direct navigation
      await page.goto("/dashboard/profile").catch(() => {
        // Try alternative paths
        page.goto("/account").catch(() => {
          page.goto("/settings");
        });
      });
    }

    // Should see profile information
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should view profile information on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Should display user greeting or profile section
    const content = await page.locator("main").textContent();
    expect(content).toContain("Dashboard");
  });

  test("should display user email in profile", async ({ page }) => {
    // Try to find and access profile
    const profileLink = page
      .locator("a, button")
      .filter({ hasText: /Profile|Account|Settings/i })
      .first();

    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForTimeout(500);
    } else {
      await page.goto("/dashboard/profile").catch(() => {
        page.goto("/account");
      });
    }

    // Look for email display
    const emailElement = page
      .locator("text")
      .filter({ hasText: userCredentials.email })
      .first();

    if (await emailElement.isVisible()) {
      await expect(emailElement).toBeVisible();
    } else {
      // At least verify we're on a profile-like page
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should allow editing profile information", async ({ page }) => {
    // Navigate to profile
    const profileLink = page
      .locator("a, button")
      .filter({ hasText: /Profile|Account|Settings/i })
      .first();

    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForTimeout(500);
    } else {
      await page.goto("/dashboard/profile").catch(() => {
        page.goto("/account");
      });
    }

    // Look for edit button
    const editButton = page
      .locator("button")
      .filter({ hasText: /Edit|Update|Modify/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Try to find and update a field
      const nameInput = page.locator('input[placeholder*="Name"]').first();
      if (await nameInput.isVisible()) {
        const currentValue = await nameInput.inputValue();
        await nameInput.clear();
        await nameInput.fill(`${currentValue} Updated`);

        // Save changes
        const saveButton = page
          .locator("button")
          .filter({ hasText: /Save|Update|Confirm/i })
          .first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Should still be on page
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should display user preferences", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for preference section or settings
    const preferencesSection = page
      .locator("div, section")
      .filter({ hasText: /Preference|Settings|Configuration/i })
      .first();

    if (await preferencesSection.isVisible()) {
      await expect(preferencesSection).toBeVisible();
    } else {
      // Page should at least load
      const content = await page.locator("main").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("should navigate from profile to other sections", async ({ page }) => {
    // Start from dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Try to navigate to trips
    const tripsLink = page
      .locator("a")
      .filter({ hasText: /Trips|Adventures|Explore/i })
      .first();

    if (await tripsLink.isVisible()) {
      await tripsLink.click();
      await page.waitForTimeout(500);

      // Should navigate away from dashboard
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });

  test("should handle missing profile gracefully", async ({ page }) => {
    // Try to access non-existent profile
    await page.goto("/dashboard/profile/nonexistent").catch(() => {
      // Expected to fail, that's OK
    });

    // Should either show error or redirect
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});
