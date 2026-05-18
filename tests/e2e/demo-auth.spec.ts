import { test, expect } from "@playwright/test";
import { createDemoInviteToken } from "../../src/lib/auth/invite-token";
import { buildDemoInviteUrl } from "../../src/lib/auth/invite-url";

function setDemoEnv() {
  process.env.DEMO_INVITE_SECRET = "playwright-invite-secret";
  process.env.DEMO_SESSION_SECRET = "playwright-session-secret";
  process.env.DEMO_BASE_URL = "http://localhost:3000";
  process.env.DEMO_INVITE_MAX_AGE_HOURS = "72";
  process.env.DEMO_SESSION_MAX_AGE_HOURS = "12";
}

test.beforeEach(async ({ context }) => {
  setDemoEnv();
  await context.clearCookies();
});

test("redirects unauthenticated users to access page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Demo access required" })).toBeVisible();
});

test("logs in with a valid invite token", async ({ page }) => {
  const { token } = await createDemoInviteToken({
    inviteId: "invite_playwright",
    reviewerLabel: "Playwright",
  });
  const url = buildDemoInviteUrl(token);

  await page.goto(url);

  await expect(page.getByText("Signed in as Playwright")).toBeVisible();
  // Dashboard now shows the company name as the primary heading
  await expect(page.getByRole("heading", { name: "Demo Company Oy" })).toBeVisible();
});

test("shows dashboard shell and supports logout", async ({ page }) => {
  const { token } = await createDemoInviteToken({
    inviteId: "invite_playwright_shell",
    reviewerLabel: "Playwright",
  });
  const url = buildDemoInviteUrl(token);

  await page.goto(url);

  await expect(page.getByRole("heading", { name: "Demo Company Oy" })).toBeVisible();
  await expect(page.getByText("Review in progress")).toBeVisible();
  await expect(page.getByText("Run highlights")).toBeVisible();

  await page.getByRole("link", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "You are now logged out" })).toBeVisible();
});

test("rejects malformed invite tokens", async ({ page }) => {
  await page.goto("/access?token=invalid");

  await expect(page.getByRole("heading", { name: "This invite link is not valid" })).toBeVisible();
});
