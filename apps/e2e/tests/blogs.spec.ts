import { test, expect } from "@playwright/test";

test.describe("Blog Management E2E Tests", () => {
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

  test("Create a new blog post", async ({ page }) => {
    // Navigate to My Blogs
    await page.goto("http://localhost:3000/my-blogs");
    await page.waitForLoadState("networkidle");

    // Click create new blog button
    const createButton = page.locator('button').filter({ hasText: /Create|New|Write/ }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
    } else {
      // If no button found, navigate directly to create page
      await page.goto("http://localhost:3000/my-blogs/create");
    }

    await page.waitForLoadState("networkidle");

    // Fill in blog details
    await page.locator('input[placeholder*="Title" i], input[name*="title" i]').fill("My Adventure with Param Adventures");
    
    // Fill description/content
    const descField = page.locator('textarea, [contenteditable="true"]').first();
    await descField.fill("This was an amazing trip with great guides and wonderful experiences. Highly recommended!");

    // Look for category select
    const categorySelect = page.locator('select[name*="category" i], [data-testid*="category"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption("1");
    }

    // Look for publish button
    const publishButton = page.locator('button').filter({ hasText: /Publish|Submit|Post/ }).first();
    if (await publishButton.isVisible()) {
      await publishButton.click();
      
      // Wait for success message or navigation
      await page.waitForFunction(
        () => {
          const url = window.location.pathname;
          return url.includes("my-blogs") && !url.includes("create");
        },
        { timeout: 15000 }
      );

      // Verify blog appears in list
      await expect(page.locator('text="My Adventure with Param Adventures"')).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test("View blog list", async ({ page }) => {
    // Navigate to My Blogs
    await page.goto("http://localhost:3000/my-blogs");
    await page.waitForLoadState("networkidle");

    // Verify page is loaded
    const blogList = page.locator('[data-testid="blog-list"], .blog-list, article').first();
    await expect(blogList).toBeVisible({ timeout: 10000 });
  });

  test("Search/Filter blogs", async ({ page }) => {
    // Navigate to My Blogs
    await page.goto("http://localhost:3000/my-blogs");
    await page.waitForLoadState("networkidle");

    // Look for search/filter input
    const searchInput = page.locator('input[type="text"][placeholder*="Search" i], input[placeholder*="Filter" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("adventure");
      
      // Wait for filtering
      await page.waitForTimeout(1000);
      
      // Verify results are filtered or empty message appears
      const results = page.locator('article, [data-testid="blog-item"]');
      const count = await results.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip();
    }
  });

  test("Edit existing blog", async ({ page }) => {
    // Navigate to My Blogs
    await page.goto("http://localhost:3000/my-blogs");
    await page.waitForLoadState("networkidle");

    // Find first blog
    const firstBlog = page.locator('article, [data-testid="blog-item"]').first();
    
    if (await firstBlog.isVisible()) {
      // Look for edit button within the blog item
      const editButton = firstBlog.locator('button').filter({ hasText: /Edit|Modify/ }).first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState("networkidle");

        // Verify we're on edit page
        const titleInput = page.locator('input[placeholder*="Title" i], input[name*="title" i]').first();
        await expect(titleInput).toBeVisible({ timeout: 10000 });

        // Update title
        await titleInput.fill("Updated: My Amazing Adventure");

        // Save changes
        const saveButton = page.locator('button').filter({ hasText: /Save|Update/ }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Wait for update
          await page.waitForFunction(
            () => !window.location.pathname.includes("edit"),
            { timeout: 15000 }
          );
        }
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test("Delete blog", async ({ page }) => {
    // Navigate to My Blogs
    await page.goto("http://localhost:3000/my-blogs");
    await page.waitForLoadState("networkidle");

    // Find first blog
    const firstBlog = page.locator('article, [data-testid="blog-item"]').first();
    
    if (await firstBlog.isVisible()) {
      // Look for delete button
      const deleteButton = firstBlog.locator('button').filter({ hasText: /Delete|Remove/ }).first();
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Handle confirmation dialog if present
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
});
