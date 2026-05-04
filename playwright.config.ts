import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next dev --port 3003",
    url: "http://localhost:3003",
    reuseExistingServer: true,
  },
});
