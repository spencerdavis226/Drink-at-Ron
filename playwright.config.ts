import { defineConfig, devices } from "@playwright/test";
const port = process.env.TEST_PORT || "4173";
const base = process.env.BASE_PATH || "/";
export default defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results/game",
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${port}${base}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}${base}`,
    reuseExistingServer: !process.env.CI,
  },
});
