import { test, expect, type Page } from "@playwright/test";
import { DEMO_SESSION_COOKIE_NAME } from "../../src/lib/auth/auth-config";
import { createDemoSessionToken } from "../../src/lib/auth/session-token";

function setDemoEnv() {
  process.env.DEMO_INVITE_SECRET = "playwright-invite-secret";
  process.env.DEMO_SESSION_SECRET = "playwright-session-secret";
  process.env.DEMO_BASE_URL = "http://127.0.0.1:3001";
  process.env.DEMO_INVITE_MAX_AGE_HOURS = "72";
  process.env.DEMO_SESSION_MAX_AGE_HOURS = "12";
}

async function signInForPlaywright(page: Page) {
  const { token } = await createDemoSessionToken({
    sessionId: "session_playwright",
    reviewerLabel: "Playwright",
  });

  await page.context().addCookies([
    {
      name: DEMO_SESSION_COOKIE_NAME,
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

test.beforeEach(async ({ context }) => {
  setDemoEnv();
  await context.clearCookies();
});

test("redirects unauthenticated users to access page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Demo access required" })).toBeVisible();
});

test("renders the dashboard shell for an authenticated session", async ({ page }) => {
  await signInForPlaywright(page);

  await page.goto("/");

  await expect(page.getByText("Signed in as Playwright")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Demo Company Oy" })).toBeVisible();
});

test("shows dashboard shell and supports logout", async ({ page }) => {
  await signInForPlaywright(page);

  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Demo Company Oy" })).toBeVisible();
  await expect(page.getByText("Review in progress")).toBeVisible();
  await expect(page.getByText("Run highlights")).toBeVisible();
  await expect(page.getByText("Detected anomalies")).toBeVisible();
  await expect(page.getByText("Waiting for customer")).toBeVisible();
  expect(pageErrors).toEqual([]);

  await page.getByRole("link", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "You are now logged out" })).toBeVisible();
});

test("rejects malformed invite tokens", async ({ page }) => {
  await page.goto("/access?token=invalid");

  await expect(page.getByRole("heading", { name: "This invite link is not valid" })).toBeVisible();
});
