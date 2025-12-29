import { test, expect } from '@playwright/test';

test.describe('Trip Booking Flow', () => {
  const credentials = {
    email: `e2e-booker-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'E2E Booker',
  };

  test.beforeAll(async ({ browser }) => {
    // Create the user once for these tests via registration
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/signup');
    await page.fill('input[placeholder="John Doe"]', credentials.name);
    await page.fill('input[placeholder="name@example.com"]', credentials.email);
    await page.fill('input[placeholder="Create a strong password"]', credentials.password);
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector('text=Welcome Aboard!');
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="name@example.com"]', credentials.email);
    await page.fill('input[placeholder="••••••••"]', credentials.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should find and book a trip', async ({ page }) => {
    await page.goto('/trips');
    
    // Wait for trips to load
    await page.waitForSelector('.group.relative.flex.flex-col');
    
    // Click on the first trip title link
    const firstTripLink = page.locator('.group.relative.flex.flex-col h3 a').first();
    const tripTitle = await firstTripLink.innerText();
    await firstTripLink.click();
    
    // Check if we are on the trip page
    await expect(page.locator('h1')).toContainText(tripTitle);
    
    // Click "Join Trip" in the booking card
    await page.click('button:has-text("Join Trip")');
    
    // Wait for the modal
    await expect(page.locator('text=Book Adventure')).toBeVisible();
    
    // Select a date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Increase guests
    await page.click('button:has-text("+")');
    
    // Click "Confirm Booking"
    await page.click('button:has-text("Confirm Booking")');
    
    // Check for "Booking Requested" in the card after modal closes
    await expect(page.locator('text=Booking Requested')).toBeVisible();
  });
});
