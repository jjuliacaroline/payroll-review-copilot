import { SignJWT, jwtVerify } from "jose";
import { getDemoAuthConfig } from "./auth-config";
import type { DemoSessionPayload } from "./types";

type CreateDemoSessionTokenInput = {
  reviewerLabel: string;
  sessionId: string;
  maxAgeHours?: number;
};

function sessionSecretKey() {
  return new TextEncoder().encode(getDemoAuthConfig().sessionSecret);
}

export async function createDemoSessionToken(input: CreateDemoSessionTokenInput) {
  const config = getDemoAuthConfig();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + (input.maxAgeHours ?? config.sessionMaxAgeHours) * 60 * 60 * 1000);
  const session: DemoSessionPayload = {
    type: "demo_session",
    sessionId: input.sessionId,
    reviewerLabel: input.reviewerLabel,
    role: "reviewer",
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(sessionSecretKey());

  return { token, session };
}

export async function verifyDemoSessionToken(token: string): Promise<DemoSessionPayload> {
  const config = getDemoAuthConfig();
  try {
    const { payload } = await jwtVerify(token, sessionSecretKey(), {
      audience: config.audience,
      issuer: config.issuer,
    });

    if (
      payload.type !== "demo_session" ||
      payload.role !== "reviewer" ||
      typeof payload.sessionId !== "string" ||
      typeof payload.reviewerLabel !== "string" ||
      typeof payload.issuedAt !== "string" ||
      typeof payload.expiresAt !== "string"
    ) {
      throw new Error("demo_session_invalid");
    }

    return payload as DemoSessionPayload;
  } catch (error) {
    if (error instanceof Error && error.name === "JWTExpired") {
      throw new Error("demo_session_expired");
    }

    throw new Error("demo_session_invalid");
  }
}
