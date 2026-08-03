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
      domain: "localhost",
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
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3001",
  });
});

test("updates an anomaly and persists the review state", async ({ page }) => {
  await signInForPlaywright(page);

  await page.goto("/");

  const anomalyCard = page.getByRole("article", { name: /Missing working hours entry/ });
  await expect(anomalyCard).toBeVisible();
  await expect(anomalyCard.getByRole("button", { name: "Mark as reviewed" })).toBeEnabled();

  await anomalyCard.getByRole("button", { name: "Mark as reviewed" }).click();

  await expect(anomalyCard.getByText("Reviewed")).toBeVisible();

  await page.reload();

  await expect(page.getByRole("article", { name: /Missing working hours entry/ }).getByText("Reviewed")).toBeVisible();
});

test("drafts, copies, tones, and sends a customer message", async ({ page }) => {
  await signInForPlaywright(page);

  await page.goto("/");

  const anomalyCard = page.getByRole("article", { name: /Missing tax card data/ });
  await expect(anomalyCard).toBeVisible();

  await anomalyCard.getByRole("button", { name: "Generate customer message" }).click();

  const modal = page.getByRole("dialog", { name: /Review before sending/ });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("Täydennyspyyntö: puuttuva verokortti")).toBeVisible();
  await expect(modal.getByText("Palkka-aineistosta puuttuu ajantasainen verokortti.")).toBeVisible();

  await modal.getByRole("button", { name: "Copy message" }).click();
  await expect(modal.getByText("Kopioitu leikepöydälle.")).toBeVisible();

  await modal.getByRole("button", { name: "Improve tone" }).click();
  await expect(modal.getByText("Kiireellinen täydennyspyyntö: puuttuva verokortti")).toBeVisible();
  await expect(modal.getByText("Pyydämme toimittamaan puuttuvat tiedot pikaisesti")).toBeVisible();

  await modal.getByRole("button", { name: "Mark as sent" }).click();

  await expect(modal).toBeHidden();

  await page.reload();

  await expect(page.getByRole("article", { name: /Missing tax card data/ }).getByText("Waiting for customer")).toBeVisible();
});
