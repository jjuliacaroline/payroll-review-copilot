import { afterEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { createDemoSessionToken, verifyDemoSessionToken } from "./session-token";

function clearEnv() {
  delete process.env.DEMO_INVITE_SECRET;
  delete process.env.DEMO_SESSION_SECRET;
  delete process.env.DEMO_BASE_URL;
}

describe("session token", () => {
  afterEach(() => {
    clearEnv();
  });

  it("creates and verifies a valid session token", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    const { token, session } = await createDemoSessionToken({
      reviewerLabel: "Demo Reviewer",
      sessionId: "session_123",
    });

    const payload = await verifyDemoSessionToken(token);

    expect(payload.sessionId).toBe("session_123");
    expect(payload.reviewerLabel).toBe("Demo Reviewer");
    expect(payload.issuedAt).toBe(session.issuedAt);
    expect(payload.expiresAt).toBe(session.expiresAt);
  });

  it("rejects a token signed with the wrong secret", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret-a";

    const token = await new SignJWT({
      type: "demo_session",
      sessionId: "session_123",
      reviewerLabel: "Demo Reviewer",
      role: "reviewer",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("payroll-review-copilot")
      .setAudience("demo-access")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("session-secret-b"));

    await expect(verifyDemoSessionToken(token)).rejects.toThrow("demo_session_invalid");
  });

  it("rejects expired sessions", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    const token = await new SignJWT({
      type: "demo_session",
      sessionId: "session_123",
      reviewerLabel: "Demo Reviewer",
      role: "reviewer",
      issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("payroll-review-copilot")
      .setAudience("demo-access")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode("session-secret"));

    await expect(verifyDemoSessionToken(token)).rejects.toThrow("demo_session_expired");
  });
});
