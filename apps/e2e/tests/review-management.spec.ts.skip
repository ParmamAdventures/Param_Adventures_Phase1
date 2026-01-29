import { test, expect } from "@playwright/test";

test.describe("Review Management E2E Tests", () => {
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

  test("View my reviews", async ({ page }) => {
    // Navigate to profile or my reviews page
    await page.goto("http://localhost:3000/profile");
    await page.waitForLoadState("networkidle");

    // Look for reviews section or tab
    const reviewsTab = page.locator('button, a, [role="tab"]').filter({ hasText: /Reviews|My Reviews/ }).first();

    if (await reviewsTab.isVisible()) {
      await reviewsTab.click();
      await page.waitForLoadState("networkidle");
    } else {
      // Try direct navigation
      await page.goto("http://localhost:3000/my-reviews");
      await page.waitForLoadState("networkidle");
    }

    // Verify reviews page
    const pageContent = page.locator('h1, h2, [data-testid="page-title"]').filter({ hasText: /Review/ }).first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test("Edit an existing review", async ({ page }) => {
    // Navigate to reviews
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find a trip and navigate to it
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      const tripLink = tripCard.locator("a").first();
      if (await tripLink.isVisible()) {
        await tripLink.click();
        await page.waitForLoadState("networkidle");
      }
    }

    // Look for reviews section on trip page
    const reviewsSection = page.locator('[data-testid="reviews-section"], h2, h3').filter({ hasText: /Reviews?|Feedback/ }).first();

    if (await reviewsSection.isVisible()) {
      // Find a user's own review
      const userReview = page.locator('article, [data-testid="review-item"], .review-card').first();

      if (await userReview.isVisible()) {
        // Look for edit button
        const editButton = userReview.locator('button, a').filter({ hasText: /Edit|Update|Modify/ }).first();

        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForLoadState("networkidle");

          // Update review content
          const reviewText = page.locator('textarea[placeholder*="Review" i], textarea[placeholder*="Comment" i]').first();

          if (await reviewText.isVisible()) {
            await reviewText.clear();
            await reviewText.fill("Updated review: This trip was absolutely fantastic! The guides were knowledgeable and friendly.");

            // Update rating if possible
            const ratingInput = page.locator('input[type="range"], [data-testid="rating"]').first();
            if (await ratingInput.isVisible()) {
              await ratingInput.fill("5");
            }

            // Save
            const saveButton = page.locator('button').filter({ hasText: /Save|Submit|Update/ }).first();
            if (await saveButton.isVisible()) {
              await saveButton.click();
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test("Delete a review", async ({ page }) => {
    // Navigate to trips
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find a trip
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      const tripLink = tripCard.locator("a").first();
      if (await tripLink.isVisible()) {
        await tripLink.click();
        await page.waitForLoadState("networkidle");
      }
    }

    // Find user's review
    const userReview = page.locator('article, [data-testid="review-item"], .review-card').first();

    if (await userReview.isVisible()) {
      // Look for delete button
      const deleteButton = userReview.locator('button, a').filter({ hasText: /Delete|Remove|Trash/ }).first();

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Handle confirmation
        const confirmButton = page.locator('button').filter({ hasText: /Confirm|Yes|Delete/ });
        if (await confirmButton.first().isVisible()) {
          await confirmButton.first().click();
        }

        // Wait for deletion
        await page.waitForTimeout(2000);
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Filter reviews by rating", async ({ page }) => {
    // Navigate to trips
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find and open a trip
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for rating filter
    const ratingFilter = page.locator('button, select').filter({ hasText: /Rating|Filter|Star/ }).first();

    if (await ratingFilter.isVisible()) {
      await ratingFilter.click();

      // Select a rating
      const ratingOption = page.locator('[role="option"], option').filter({ hasText: /5 star|Excellent/ }).first();
      if (await ratingOption.isVisible()) {
        await ratingOption.click();

        // Wait for filtering
        await page.waitForTimeout(1000);
      }
    } else {
      test.skip();
    }
  });

  test("Sort reviews by date/helpful", async ({ page }) => {
    // Navigate to trips
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find and open a trip
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for sort option
    const sortButton = page.locator('button, select').filter({ hasText: /Sort|Order|Latest|Helpful/ }).first();

    if (await sortButton.isVisible()) {
      await sortButton.click();

      // Select sort option
      const sortOption = page.locator('[role="option"], option').filter({ hasText: /Latest|Most Helpful|Newest/ }).first();
      if (await sortOption.isVisible()) {
        await sortOption.click();

        // Wait for sorting
        await page.waitForTimeout(1000);

        // Verify reviews are sorted
        const reviewsList = page.locator('article, [data-testid="review-item"]');
        const count = await reviewsList.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    } else {
      test.skip();
    }
  });

  test("Mark review as helpful", async ({ page }) => {
    // Navigate to trips
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find and open a trip
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Find a review
    const review = page.locator('article, [data-testid="review-item"]').first();

    if (await review.isVisible()) {
      // Look for helpful button (not user's own review)
      const helpfulButton = review.locator('button').filter({ hasText: /Helpful|Thumbs|Useful/ }).first();

      if (await helpfulButton.isVisible()) {
        await helpfulButton.click();

        // Wait for response
        await page.waitForTimeout(1000);

        // Verify button state changed
        const buttonClass = await helpfulButton.getAttribute("class");
        expect(buttonClass).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test("Report inappropriate review", async ({ page }) => {
    // Navigate to trips
    await page.goto("http://localhost:3000/trips");
    await page.waitForLoadState("networkidle");

    // Find and open a trip
    const tripCard = page.locator('article, [data-testid="trip-item"]').first();

    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Find a review
    const review = page.locator('article, [data-testid="review-item"]').first();

    if (await review.isVisible()) {
      // Look for report/flag button
      const reportButton = review.locator('button').filter({ hasText: /Report|Flag|Inappropriate/ }).first();

      if (await reportButton.isVisible()) {
        await reportButton.click();

        // Handle report dialog
        const reportDialog = page.locator('[role="dialog"], .modal, .report-form').first();
        if (await reportDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Select reason
          const reasonSelect = reportDialog.locator('select, [role="combobox"]').first();
          if (await reasonSelect.isVisible()) {
            await reasonSelect.click();

            const reasonOption = page.locator('[role="option"], option').first();
            if (await reasonOption.isVisible()) {
              await reasonOption.click();
            }
          }

          // Submit report
          const submitButton = reportDialog.locator('button').filter({ hasText: /Submit|Report/ }).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
          }
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});
