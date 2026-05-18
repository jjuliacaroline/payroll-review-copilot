import { expect, test, type Page } from "@playwright/test";
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

test("opens the detail drawer, records the action, and marks an anomaly reviewed", async ({ page }) => {
  await signInForPlaywright(page);

  await page.goto("/");

  const anomalyCard = page.getByRole("article", { name: /Missing working hours entry/ });
  await expect(anomalyCard).toBeVisible();

  await anomalyCard.getByRole("button", { name: "Review details" }).click();

  const drawer = page.getByRole("dialog", { name: /Missing working hours entry details/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Action history")).toBeVisible();
  await expect(drawer.getByText("Opened detail view")).toBeVisible();

  await drawer.getByRole("button", { name: "Mark as reviewed" }).click();

  await expect(anomalyCard.getByText("Reviewed")).toBeVisible();

  await page.reload();

  const refreshedCard = page.getByRole("article", { name: /Missing working hours entry/ });
  await expect(refreshedCard.locator("span").filter({ hasText: /^Reviewed$/ })).toBeVisible();

  await refreshedCard.getByRole("button", { name: "Review details" }).click();
  await expect(page.getByRole("dialog", { name: /Missing working hours entry details/ }).getByText("Opened detail view")).toBeVisible();
});

test("ignores an anomaly with a reason", async ({ page }) => {
  await signInForPlaywright(page);

  await page.goto("/");

  const anomalyCard = page.getByRole("article", { name: /Net salary changed sharply/ });
  await expect(anomalyCard).toBeVisible();

  await anomalyCard.getByRole("button", { name: "Ignore with reason" }).click();

  const dialog = page.getByRole("dialog", { name: /Ignore with reason/ });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("False positive").click();
  await dialog.getByRole("textbox").fill("Confirmed outside the payroll system.");
  await dialog.getByRole("button", { name: "Ignore anomaly" }).click();

  await expect(anomalyCard.getByText("Ignored")).toBeVisible();

  await page.reload();

  await expect(page.getByRole("article", { name: /Net salary changed sharply/ }).getByText("Ignored")).toBeVisible();
});
