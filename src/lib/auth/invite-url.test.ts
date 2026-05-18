import { afterEach, describe, expect, it } from "vitest";
import { buildDemoInviteUrl } from "./invite-url";

function clearEnv() {
  delete process.env.DEMO_INVITE_SECRET;
  delete process.env.DEMO_SESSION_SECRET;
  delete process.env.DEMO_BASE_URL;
  delete process.env.DEMO_INVITE_MAX_AGE_HOURS;
  delete process.env.DEMO_SESSION_MAX_AGE_HOURS;
}

describe("buildDemoInviteUrl", () => {
  afterEach(() => {
    clearEnv();
  });

  it("throws when base URL is missing", () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    expect(() => buildDemoInviteUrl("token")).toThrow("Missing DEMO_BASE_URL");
  });

  it("builds an invite URL with token", () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";
    process.env.DEMO_BASE_URL = "http://localhost:3000";

    const url = buildDemoInviteUrl("token-123");

    expect(url).toBe("http://localhost:3000/access?token=token-123");
  });
});
