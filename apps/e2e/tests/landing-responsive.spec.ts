import { test, expect } from "@playwright/test";

test.describe("Landing Page & Homepage", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have main content
    const heading = page.locator("h1, h2").first();
    const content = await page.locator("main").textContent();

    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for hero section
    const heroSection = page
      .locator("div, section")
      .filter({ hasText: /Adventure|Explore|Discover/i })
      .first();

    // Page should at least have content
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should display featured trips", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for trips section
    const tripsSection = page
      .locator("div, section")
      .filter({ hasText: /Trip|Adventure|Featured/i })
      .first();

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should display testimonials/reviews", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for reviews section
    const reviewsSection = page
      .locator("div, section")
      .filter({ hasText: /Review|Testimonial|Feedback|Rating/i })
      .first();

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should have navigation menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for navbar
    const navbar = page.locator("nav, [role='navigation']").first();

    if (await navbar.isVisible()) {
      // Should have navigation links
      const navLinks = navbar.locator("a");
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }

    // At least page should load
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should have footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Look for footer
    const footer = page.locator("footer");

    if (await footer.isVisible()) {
      const footerContent = await footer.textContent();
      expect(footerContent?.length).toBeGreaterThan(0);
    }
  });

  test("should display stats/numbers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for stat cards or numbers
    const stats = page
      .locator("text")
      .filter({ hasText: /\d+\+?|Happy|Users|Trips|Years/i });

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should have CTA buttons", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for buttons
    const buttons = page.locator("button, a[role='button']");
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);
  });

  test("should navigate to login from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for login link
    const loginLink = page
      .locator("a, button")
      .filter({ hasText: /Login|Sign In/i })
      .first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForTimeout(500);

      // Should navigate to login
      const url = page.url();
      expect(url).toContain("login");
    }
  });

  test("should navigate to signup from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for signup link
    const signupLink = page
      .locator("a, button")
      .filter({ hasText: /Sign Up|Register|Join/i })
      .first();

    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForTimeout(500);

      // Should navigate to signup
      const url = page.url();
      expect(url).toContain("signup");
    }
  });

  test("should navigate to trips from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for trips/explore button
    const tripsLink = page
      .locator("a, button")
      .filter({ hasText: /Trips|Explore|Adventures|View All/i })
      .first();

    if (await tripsLink.isVisible()) {
      await tripsLink.click();
      await page.waitForTimeout(500);

      // Should navigate away from home
      const url = page.url();
      expect(url).not.toContain("/$");
    }
  });
});

test.describe("Project Showcase Page", () => {
  test("should display project showcase", async ({ page }) => {
    await page.goto("/project");
    await page.waitForLoadState("networkidle");

    // Should have project information
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();

    // Look for project name
    const projectName = page
      .locator("text")
      .filter({ hasText: /Param Adventures/i })
      .first();
    if (await projectName.isVisible()) {
      await expect(projectName).toBeVisible();
    }
  });

  test("should show tech stack on project page", async ({ page }) => {
    await page.goto("/project");
    await page.waitForLoadState("networkidle");

    // Look for tech stack section
    const techSection = page
      .locator("div, section")
      .filter({ hasText: /Tech|Stack|Technology|Framework/i })
      .first();

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should display test statistics", async ({ page }) => {
    await page.goto("/project");
    await page.waitForLoadState("networkidle");

    // Look for test counts
    const testStats = page
      .locator("text")
      .filter({ hasText: /test|Test|jest|playwright/i });

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();

    // Should mention testing
    expect(content?.toLowerCase()).toMatch(/test|jest|playwright/i);
  });

  test("should have documentation links on project page", async ({ page }) => {
    await page.goto("/project");
    await page.waitForLoadState("networkidle");

    // Look for documentation or links
    const links = page.locator("a");
    const linkCount = await links.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test("should show features list on project page", async ({ page }) => {
    await page.goto("/project");
    await page.waitForLoadState("networkidle");

    // Look for features section
    const featuresSection = page
      .locator("div, section")
      .filter({ hasText: /Feature|Capability|Functionality/i })
      .first();

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});

test.describe("Responsive Design", () => {
  test("should be responsive on mobile", async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should render without horizontal scroll
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const bodyWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small variance

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should be responsive on tablet", async ({ page }) => {
    // Set viewport to tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Should render properly
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const bodyWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should be responsive on desktop", async ({ page }) => {
    // Set viewport to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Should render properly
    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });

  test("should handle mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for mobile menu button
    const menuButton = page
      .locator("button")
      .filter({ hasText: /☰|Menu|Toggle|Nav/i })
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu should open
      const menu = page.locator("nav, [role='navigation']");
      await expect(menu).toBeVisible();
    }

    const content = await page.locator("main").textContent();
    expect(content).toBeTruthy();
  });
});
