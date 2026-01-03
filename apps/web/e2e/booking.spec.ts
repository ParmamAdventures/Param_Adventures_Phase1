import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
    // 1. Mock the Trip Data & Payment Intent to avoid real dependencies
    test.beforeEach(async ({ page }) => {
        // Mock Trip Details API
        await page.route("*/**/trips/public/*", async (route) => {
            if (route.request().method() === 'GET') {
                const json = {
                    id: "test-trip-123",
                    title: "E2E Test Expedition",
                    slug: "e2e-test-expedition",
                    price: 5000,
                    duration: 5,
                    difficulty: "Easy",
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    images: ["https://example.com/image.jpg"],
                    itinerary: []
                };
                await route.fulfill({ json });
            } else {
                await route.continue();
            }
        });
    });

    test("Guest cannot book without login", async ({ page }) => {
        await page.goto("/trips/e2e-test-expedition");
        
        // Wait for page to load
        await expect(page.getByRole("heading", { name: "E2E Test Expedition" })).toBeVisible();

        // Click Book Now
        await page.getByRole("button", { name: "Book Now" }).click();

        // Should redirect to Login
        await expect(page).toHaveURL(/.*login/);
    });

    test("Logged-in user can complete booking", async ({ page }) => {
        // 1. Mock Auth (Fake User)
        await page.route("*/**/auth/me", async (route) => {
            await route.fulfill({
                json: {
                    user: {
                        id: "test-user-id",
                        email: "test@example.com",
                        name: "Test User",
                        roles: ["USER"],
                        permissions: []
                    }
                }
            });
        });

        // 2. Mock Payment Intent (Razorpay Start)
        await page.route("*/**/payments/intent", async (route) => {
            await route.fulfill({
                status: 201,
                json: {
                    paymentId: "pay_test_123",
                    orderId: "order_test_123",
                    amount: 500000,
                    currency: "INR",
                    key: "rzp_test_123"
                }
            });
        });

        // 3. Mock Payment Verification (Success)
        await page.route("*/**/payments/verify", async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, message: "Payment verified" }
            });
        });

        // ACTION: Go to Trip Page
        await page.goto("/trips/e2e-test-expedition");

        // ACTION: Click Book Now
        await page.getByRole("button", { name: "Book Now" }).click();

        // EXPECT: Booking Form (Guest Details)
        await expect(page.getByRole("heading", { name: "Booking Details" })).toBeVisible();

        // ACTION: Fill Form
        await page.fill('input[name="guests[0].name"]', "Test Guest");
        await page.fill('input[name="guests[0].age"]', "25");

        // ACTION: Proceed to Payment
        // Note: The frontend might require "Agree to Terms" if implemented? Assuming standard form.
        const payButton = page.getByRole("button", { name: /Pay/i });
        await expect(payButton).toBeVisible();
        
        // Mock Razorpay Popup (Frontend Logic: If we click Pay, it calls API, then opens Razorpay)
        // Since we can't interact with Razorpay Iframe, we can't fully automate the "Success" callback 
        // strictly via UI unless we expose a "Dev Bypass" or mock the window.Razorpay object.
        
        // Strategy: We check that the "Pay" button calls the Intent API (Route matched).
        // For full E2E of Success Page, we'd need to manually trigger the verify callback in the browser context.
        
        // Let's just click Pay and assert we attempted it.
        await payButton.click();

        // To create a robust test, we can inject a script to mock window.Razorpay
        await page.evaluate(() => {
            (window as any).Razorpay = function(options: any) {
                this.open = function() {
                    // Simulate Success Callback immediately
                    options.handler({
                        razorpay_payment_id: "pay_simulated",
                        razorpay_order_id: options.order_id,
                        razorpay_signature: "simulated_sig"
                    });
                };
            };
        });

        // Click again to trigger the mocked Razorpay
        await payButton.click();

        // EXPECT: Redirect to My Bookings or Success Toast
        // Waiting for URL change or Success Element
        // Given we mock verify -> success, it should redirect.
        await expect(page).toHaveURL(/.*dashboard\/bookings/);
    });
});
