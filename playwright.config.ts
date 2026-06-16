import { defineConfig, devices } from "@playwright/test";

// E2E config. We test the production build via `vite preview` (not the dev
// server) so the bundled PDF.js worker and the lazy TV Prompt chunk behave
// exactly as they do in the deployed app. The app is served under the GitHub
// Pages sub-path, so baseURL includes it and the tests navigate hash routes.
const PORT = 4173;
const BASE_PATH = "/player-pack-generator/";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}${BASE_PATH}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `yarn build && yarn preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
