import { afterEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { createDemoInviteToken, verifyDemoInviteToken } from "./invite-token";

function clearEnv() {
  delete process.env.DEMO_INVITE_SECRET;
  delete process.env.DEMO_SESSION_SECRET;
  delete process.env.DEMO_BASE_URL;
}

describe("invite token", () => {
  afterEach(() => {
    clearEnv();
  });

  it("creates and verifies a valid token", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    const { token } = await createDemoInviteToken({
      inviteId: "invite_123",
      reviewerLabel: "Demo Reviewer",
    });

    const payload = await verifyDemoInviteToken(token);

    expect(payload.type).toBe("demo_invite");
    expect(payload.inviteId).toBe("invite_123");
    expect(payload.reviewerLabel).toBe("Demo Reviewer");
    expect(payload.role).toBe("reviewer");
  });

  it("rejects malformed tokens", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    await expect(verifyDemoInviteToken("not-a-token")).rejects.toThrow("demo_invite_invalid");
  });

  it("rejects wrong issuer", async () => {
    process.env.DEMO_INVITE_SECRET = "invite-secret";
    process.env.DEMO_SESSION_SECRET = "session-secret";

    const token = await new SignJWT({
      inviteId: "invite_123",
      reviewerLabel: "Demo Reviewer",
      role: "reviewer",
      type: "demo_invite",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("wrong-issuer")
      .setAudience("demo-access")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("invite-secret"));

    await expect(verifyDemoInviteToken(token)).rejects.toThrow("demo_invite_invalid");
  });
});
