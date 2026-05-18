import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    env: {
      DEMO_INVITE_SECRET: "playwright-invite-secret",
      DEMO_SESSION_SECRET: "playwright-session-secret",
      DEMO_BASE_URL: "http://127.0.0.1:3001",
      DEMO_INVITE_MAX_AGE_HOURS: "72",
      DEMO_SESSION_MAX_AGE_HOURS: "12",
    },
  },
});
