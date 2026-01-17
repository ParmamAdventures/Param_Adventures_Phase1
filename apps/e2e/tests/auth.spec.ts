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

    await page.getByPlaceholder("John Doe").fill(testUser.name);
    await page.getByPlaceholder("name@example.com").fill(testUser.email);
    await page
      .getByPlaceholder("Create a strong password")
      .fill(testUser.password);

    await page.getByRole("button", { name: "Create Account" }).click();

    // Check for success message
    await expect(page.getByText("Welcome Aboard!")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText("Your account has been created successfully")
    ).toBeVisible();
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
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

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
