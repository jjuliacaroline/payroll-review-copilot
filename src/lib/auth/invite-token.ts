import { SignJWT, jwtVerify } from "jose";
import { getDemoAuthConfig } from "./auth-config";
import type { DemoInviteTokenPayload } from "./types";

type CreateDemoInviteTokenInput = {
  inviteId: string;
  reviewerLabel: string;
  maxAgeHours?: number;
};

function inviteSecretKey() {
  return new TextEncoder().encode(getDemoAuthConfig().inviteSecret);
}

export async function createDemoInviteToken(input: CreateDemoInviteTokenInput) {
  const config = getDemoAuthConfig();
  const maxAgeHours = input.maxAgeHours ?? config.inviteMaxAgeHours;
  const token = await new SignJWT({
    inviteId: input.inviteId,
    reviewerLabel: input.reviewerLabel,
    role: "reviewer",
    type: "demo_invite",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeHours}h`)
    .sign(inviteSecretKey());

  return {
    token,
    expiresInHours: maxAgeHours,
  };
}

export async function verifyDemoInviteToken(token: string): Promise<DemoInviteTokenPayload> {
  const config = getDemoAuthConfig();
  try {
    const { payload } = await jwtVerify(token, inviteSecretKey(), {
      audience: config.audience,
      issuer: config.issuer,
    });

    if (
      payload.type !== "demo_invite" ||
      payload.role !== "reviewer" ||
      typeof payload.inviteId !== "string" ||
      typeof payload.reviewerLabel !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number" ||
      payload.iss !== config.issuer ||
      payload.aud !== config.audience
    ) {
      throw new Error("demo_invite_invalid");
    }

    return payload as DemoInviteTokenPayload;
  } catch (error) {
    if (error instanceof Error && error.name === "JWTExpired") {
      throw new Error("demo_invite_expired");
    }

    throw new Error("demo_invite_invalid");
  }
}
