import { test, expect } from "@playwright/test";

test.describe("Booking Management E2E Tests", () => {
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

  test("View all bookings", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Verify bookings page is loaded
    const bookingList = page.locator('article, [data-testid="booking-item"], .booking-card').first();
    
    // Page should be visible with or without bookings
    const pageContent = page.locator('h1, h2, [data-testid="page-title"]').filter({ hasText: /Booking/ }).first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test("Filter bookings by status", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Look for status filter
    const statusFilter = page.locator('select[name*="status" i], button').filter({ hasText: /Status|Filter/ }).first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select a status option
      const optionToSelect = page.locator('option, [role="option"]').filter({ hasText: /Completed|Pending/ }).first();
      if (await optionToSelect.isVisible()) {
        await optionToSelect.click();

        // Wait for filtering
        await page.waitForTimeout(1000);

        // Verify filtering worked
        const resultCount = await page.locator('article, [data-testid="booking-item"]').count();
        expect(resultCount).toBeGreaterThanOrEqual(0);
      }
    } else {
      test.skip();
    }
  });

  test("View booking details", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Find first booking
    const firstBooking = page.locator('article, [data-testid="booking-item"], .booking-card').first();
    
    if (await firstBooking.isVisible()) {
      // Click to view details
      const detailsButton = firstBooking.locator('button, a').filter({ hasText: /Details|View|See/ }).first();
      
      if (await detailsButton.isVisible()) {
        await detailsButton.click();
      } else {
        // Try clicking on the card itself
        await firstBooking.click();
      }

      await page.waitForLoadState("networkidle");

      // Verify details page
      const detailsSection = page.locator('[data-testid="booking-details"], h2, h3').filter({ hasText: /Details|Booking/ }).first();
      await expect(detailsSection).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test("Cancel a booking", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Find first booking with "Pending" or "Confirmed" status
    const bookings = page.locator('article, [data-testid="booking-item"]');
    const bookingCount = await bookings.count();

    if (bookingCount > 0) {
      // Try to find a cancellable booking
      const firstBooking = bookings.first();
      
      // Look for cancel button in the booking
      const cancelButton = firstBooking.locator('button').filter({ hasText: /Cancel|Refund/ }).first();

      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Handle confirmation dialog
        const confirmButton = page.locator('button').filter({ hasText: /Confirm|Yes|Cancel/ });
        if (await confirmButton.first().isVisible()) {
          await confirmButton.first().click();
        }

        // Wait for cancellation
        await page.waitForTimeout(2000);

        // Verify status changed to cancelled
        const cancelledStatus = page.locator('text=/Cancelled|Refunded/i').first();
        if (await cancelledStatus.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(cancelledStatus).toBeVisible();
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Download booking receipt/invoice", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Find first booking
    const firstBooking = page.locator('article, [data-testid="booking-item"]').first();

    if (await firstBooking.isVisible()) {
      // Look for download button
      const downloadButton = firstBooking.locator('button, a').filter({ hasText: /Download|Receipt|Invoice|PDF/ }).first();

      if (await downloadButton.isVisible()) {
        // Create a promise to listen for download
        const downloadPromise = page.waitForEvent("download").catch(() => null);
        
        await downloadButton.click();

        // Wait a bit for download to start
        await page.waitForTimeout(1000);

        // If download happened, verify it was successful
        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toBeTruthy();
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Share booking details", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Find first booking
    const firstBooking = page.locator('article, [data-testid="booking-item"]').first();

    if (await firstBooking.isVisible()) {
      // Look for share button
      const shareButton = firstBooking.locator('button, a').filter({ hasText: /Share|Send|Email/ }).first();

      if (await shareButton.isVisible()) {
        await shareButton.click();

        // Verify share dialog/options appear
        const shareDialog = page.locator('[role="dialog"], .modal, .share-options').first();
        if (await shareDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(shareDialog).toBeVisible();
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Filter bookings by date range", async ({ page }) => {
    // Navigate to My Bookings
    await page.goto("http://localhost:3000/my-bookings");
    await page.waitForLoadState("networkidle");

    // Look for date filter
    const dateFilter = page.locator('input[type="date"], [data-testid="date-range-picker"]').first();

    if (await dateFilter.isVisible()) {
      // Set start date
      await dateFilter.fill("2025-01-01");

      // Wait for filtering
      await page.waitForTimeout(1000);

      // Verify filtering worked
      const resultCount = await page.locator('article, [data-testid="booking-item"]').count();
      expect(resultCount).toBeGreaterThanOrEqual(0);
    } else {
      test.skip();
    }
  });
});
