import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/workshop",
  outputDir: "test-results/workshop",
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://127.0.0.1:5175", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 5175 --strictPort",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: false,
  },
});
