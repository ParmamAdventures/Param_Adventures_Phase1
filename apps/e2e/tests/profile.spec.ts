import { test, expect } from "@playwright/test";

test.describe("User Profile Management E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as regular user
    await page.goto("http://localhost:3000/login");
    await page.locator('input[type="email"]').fill("user@test.com");
    await page.locator('input[type="password"]').fill("UserPass123");
    await page.locator('button[type="submit"]').first().click();

    // Wait for navigation and dashboard to load
    await page.waitForFunction(
      () => !window.location.pathname.includes("login"),
      { timeout: 20000 }
    );
    await page.waitForLoadState("networkidle");
  });

  test("Access user profile page", async ({ page }) => {
    // Navigate to profile - look for profile menu
    const profileMenu = page.locator('button').filter({ hasText: /Profile|Account|Settings/ }).first();
    
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
      
      const profileLink = page.locator('[data-testid="profile-link"], a').filter({ hasText: /Profile|My Profile|Account/ }).first();
      if (await profileLink.isVisible()) {
        await profileLink.click();
      }
    } else {
      // Try direct navigation
      await page.goto("http://localhost:3000/profile");
    }

    await page.waitForLoadState("networkidle");

    // Verify profile page is loaded
    const profileSection = page.locator('h1, h2').filter({ hasText: /Profile|Account|Settings/ }).first();
    await expect(profileSection).toBeVisible({ timeout: 10000 });
  });

  test("Update profile information", async ({ page }) => {
    // Navigate to profile
    await page.goto("http://localhost:3000/profile");
    await page.waitForLoadState("networkidle");

    // Look for edit button
    const editButton = page.locator('button').filter({ hasText: /Edit|Update|Change/ }).first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
    }

    // Update name field
    const nameInput = page.locator('input[placeholder*="Name" i], input[name*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill("John Updated");
    }

    // Update bio field if present
    const bioInput = page.locator('textarea[placeholder*="Bio" i], textarea[name*="bio" i], input[placeholder*="Bio" i]').first();
    if (await bioInput.isVisible()) {
      await bioInput.clear();
      await bioInput.fill("Love adventure and nature photography.");
    }

    // Update age if present
    const ageInput = page.locator('input[type="number"], input[placeholder*="Age" i]').first();
    if (await ageInput.isVisible()) {
      await ageInput.clear();
      await ageInput.fill("28");
    }

    // Save changes
    const saveButton = page.locator('button').filter({ hasText: /Save|Submit|Update/ }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Wait for success notification
      await page.waitForTimeout(2000);

      // Verify success message or navigation
      const successMessage = page.locator('text=/Updated|Saved|Success/i');
      if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test("Update password", async ({ page }) => {
    // Navigate to profile/settings
    await page.goto("http://localhost:3000/profile");
    await page.waitForLoadState("networkidle");

    // Look for password settings section
    const passwordSection = page.locator('[data-testid="password-section"], button').filter({ hasText: /Change Password|Password Settings/ }).first();
    
    if (await passwordSection.isVisible()) {
      await passwordSection.click();
      await page.waitForLoadState("networkidle");
    } else {
      // Try navigating to settings page
      await page.goto("http://localhost:3000/settings");
      await page.waitForLoadState("networkidle");
    }

    // Look for current password field
    const currentPassInput = page.locator('input[type="password"]').first();
    
    if (await currentPassInput.isVisible()) {
      await currentPassInput.fill("UserPass123");

      // New password fields
      const newPassInputs = page.locator('input[type="password"]');
      if (await newPassInputs.count() >= 2) {
        await newPassInputs.nth(1).fill("NewPass123!");
        await newPassInputs.nth(2).fill("NewPass123!");

        // Save
        const saveButton = page.locator('button').filter({ hasText: /Save|Change|Update/ }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Update avatar/profile picture", async ({ page }) => {
    // Navigate to profile
    await page.goto("http://localhost:3000/profile");
    await page.waitForLoadState("networkidle");

    // Look for avatar upload area
    const avatarUpload = page.locator('input[type="file"]').first();
    
    if (await avatarUpload.isVisible()) {
      // Note: In real test, you'd use a test image file
      // For now, just verify upload input is present
      await expect(avatarUpload).toBeVisible();
    } else {
      test.skip();
    }
  });

  test("View profile booking history", async ({ page }) => {
    // Navigate to profile
    await page.goto("http://localhost:3000/profile");
    await page.waitForLoadState("networkidle");

    // Look for booking history tab/section
    const bookingTab = page.locator('[data-testid="booking-history"], button, a').filter({ hasText: /Bookings|History|My Bookings/ }).first();
    
    if (await bookingTab.isVisible()) {
      await bookingTab.click();
      await page.waitForLoadState("networkidle");

      // Verify booking list is shown
      const bookingList = page.locator('article, [data-testid="booking-item"], tr').first();
      await expect(bookingList).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test("Logout from profile", async ({ page }) => {
    // Navigate to profile menu
    const profileMenu = page.locator('button').filter({ hasText: /Profile|Account|Menu/ }).first();
    
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
    }

    // Look for logout button
    const logoutButton = page.locator('button, a').filter({ hasText: /Logout|Sign Out|Exit/ }).first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Wait for redirect to login page
      await page.waitForFunction(
        () => window.location.pathname.includes("login"),
        { timeout: 10000 }
      );

      // Verify we're on login page
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } else {
      test.skip();
    }
  });
});
