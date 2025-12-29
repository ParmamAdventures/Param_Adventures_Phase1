import { test, expect } from '@playwright/test';

test.describe('Admin Operations', () => {
  // We use the admin credentials from the seed/local dev defaults
  const adminCredentials = {
    email: 'admin@paramadventures.com', // Seed email
    password: 'password123', // Assuming this for local dev
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="name@example.com"]', adminCredentials.email);
    await page.fill('input[placeholder="••••••••"]', adminCredentials.password);
    await page.click('button:has-text("Sign In")');
    
    // Check if we reached the dashboard and have admin permissions
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify admin link exists in navbar
    await expect(page.locator('header')).toContainText('Admin');
  });

  test('should create a new trip as admin', async ({ page }) => {
    await page.click('nav >> text=Admin');
    await page.click('text=Trips Management');
    
    await page.click('button:has-text("Create Trip")');
    
    const tripName = `E2E Trip ${Date.now()}`;
    await page.fill('input[name="title"]', tripName);
    await page.fill('input[name="location"]', 'Himalayas');
    await page.fill('input[name="price"]', '15000');
    await page.fill('textarea[name="description"]', 'An epic E2E adventure.');
    
    // Set category
    await page.selectOption('select[name="category"]', 'TREK');
    
    // Add an itinerary day (Wait for dynamic list if needed)
    await page.click('button:has-text("Add Day")');
    await page.locator('textarea[placeholder="What happens on this day?"]').first().fill('Day 1 - Arrival and Briefing.');
    
    await page.click('button:has-text("Create Adventure")');
    
    // Should redirect back to list and show the new trip
    await expect(page).toHaveURL(/\/admin\/trips/);
    await expect(page.locator(`text=${tripName}`)).toBeVisible();
  });

  test('should manage user status', async ({ page }) => {
    await page.click('nav >> text=Admin');
    await page.click('text=User Management');
    
    // Wait for user table
    await page.waitForSelector('table');
    
    // Find a user and change status to SUSPENDED
    // We'll look for the first non-admin user if possible, or just the first row
    const firstRow = page.locator('tbody tr').first();
    const userName = await firstRow.locator('td').first().innerText();
    
    // Click the status dropdown (assuming it exists based on previous work)
    await firstRow.locator('select').selectOption('SUSPENDED');
    
    // Check for prompt (Playwright handles dialogs)
    page.once('dialog', dialog => {
      dialog.accept('E2E Testing suspension');
    });
    
    // Verify status changed
    await expect(firstRow.locator('text=SUSPENDED')).toBeVisible();
  });
});
