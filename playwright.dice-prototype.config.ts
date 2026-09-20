import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/dice-prototype",
  outputDir: "test-results/dice-prototype",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4399/Drink-at-Ron/",
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
    command:
      "BASE_PATH=/Drink-at-Ron/ npx vite preview --outDir dist-dice-prototype --host 127.0.0.1 --port 4399 --strictPort",
    url: "http://127.0.0.1:4399/Drink-at-Ron/",
    reuseExistingServer: false,
  },
});
