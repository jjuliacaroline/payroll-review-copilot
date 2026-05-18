import { afterEach, describe, expect, it } from "vitest";
import { getDemoAuthConfig } from "./auth-config";

function clearEnv() {
  delete process.env.DEMO_INVITE_SECRET;
  delete process.env.DEMO_SESSION_SECRET;
  delete process.env.DEMO_BASE_URL;
  delete process.env.DEMO_INVITE_MAX_AGE_HOURS;
  delete process.env.DEMO_SESSION_MAX_AGE_HOURS;
}

describe("getDemoAuthConfig", () => {
  afterEach(() => {
    clearEnv();
  });

  it("applies default max ages and reads required secrets", () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";
    process.env.DEMO_BASE_URL = "http://localhost:3000";

    const config = getDemoAuthConfig();

    expect(config.cookieName).toBe("payroll_review_demo_session");
    expect(config.issuer).toBe("payroll-review-copilot");
    expect(config.audience).toBe("demo-access");
    expect(config.inviteMaxAgeHours).toBe(72);
    expect(config.sessionMaxAgeHours).toBe(12);
  });

  it("throws when required secrets are missing", () => {
    expect(() => getDemoAuthConfig()).toThrow("Missing required environment variable: DEMO_INVITE_SECRET");
  });
});
