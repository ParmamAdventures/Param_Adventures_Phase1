import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Read from "../api/.env" if needed, or create a local one
dotenv.config({ path: path.resolve(__dirname, "../api/.env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [["html"], ["github"]] : "list",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  /* Configure web server for local development */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'echo "Servers should already be running"',
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
