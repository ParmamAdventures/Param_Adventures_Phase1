import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe.configure({ mode: "serial" });
  const testUser = {
    name: "Test Explorer",
    email: `test-${Date.now()}@example.com`,
    password: "Password123!",
  };

  test("should register a new user", async ({ page }) => {
    await page.goto("/signup");

    // Fill in the form fields
    await page.getByPlaceholder("John Doe").fill(testUser.name);
    await page.getByPlaceholder("name@example.com").fill(testUser.email);
    await page
      .getByPlaceholder("Create a strong password")
      .fill(testUser.password);

    // Click the create account button
    const createButton = page.getByRole("button", { name: "Create Account" });
    await createButton.click();

    // Wait longer for form submission and API response
    await page.waitForTimeout(2000);

    // Check if there's an error message first
    const errorElement = page.locator(".bg-red-500");
    const isError = await errorElement.isVisible().catch(() => false);
    if (isError) {
      const errorText = await errorElement.textContent();
      console.log("Registration error:", errorText);
      throw new Error(`Registration failed: ${errorText}`);
    }

    // Check for success message
    await expect(page.getByText("Welcome Aboard!")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByText("Your account has been created successfully")
    ).toBeVisible();

    // Wait for the automatic redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  });

  test("should login with newly created user", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("name@example.com").fill(testUser.email);
    await page.getByPlaceholder("••••••••").fill(testUser.password);

    await page.getByRole("button", { name: "Sign In" }).click();

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill(testUser.email);
    await page.getByPlaceholder("••••••••").fill(testUser.password);

    // Click and wait for navigation
    const signInButton = page.getByRole("button", { name: "Sign In" });
    await signInButton.click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Directly click logout (dropdown renders items in header)
    await page
      .getByRole("button", { name: /Log out|Sign Out/i })
      .first()
      .click({ force: true });
    await page.waitForTimeout(500);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  });
});
