import { test, expect } from '@playwright/test';

test.describe('Trip Booking Flow', () => {
  const credentials = {
    email: 'final-test-456@example.com',
    password: 'Password123!',
    name: 'Final Test 2',
  };

  /*
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
  */

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="name@example.com"]', credentials.email);
    await page.fill('input[placeholder="••••••••"]', credentials.password);
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should find and book a trip', async ({ page }) => {
    // 2. Go to trips
    await page.goto('/trips');
    
    // Wait for the main grid container
    await page.waitForSelector('.grid.gap-6', { timeout: 10000 });
    
    // 3. Find and click first trip
    // Fallback if h3 a is not working: find any link that goes to a trip detail page
    // The previous debug output showed we have links like /trips/everest-base-camp
    const firstTripLink = page.locator('a[href^="/trips/"]').first();
    // const tripTitle = await firstTripLink.innerText(); // This might be empty if the link wraps the whole card
    // Let's assume the link works and check the title on the next page
    
    await firstTripLink.click();
    
    // 4. Book Trip
    // We expect to be on a page with a title header
    await expect(page.locator('h1')).toBeVisible(); 
    
    await page.click('button:has-text("Join Trip")');
    
    await expect(page.locator('text=Book Adventure')).toBeVisible();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);
    
    await page.click('button:has-text("+")'); // Increase guests to 2
    
    await page.click('button:has-text("Confirm Booking")');
    
    // 5. Verify Success
    await expect(page.locator('text=Booking Requested')).toBeVisible();
  });
});
