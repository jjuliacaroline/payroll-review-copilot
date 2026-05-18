import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { getDemoAuthConfig } from "@/lib/auth/auth-config";
import { createInitialDemoReviewState } from "./reducers";
import type { DemoReviewState } from "./types";

const REVIEW_STATE_COOKIE_NAME = "payroll_review_demo_review_state";

type DemoReviewStateTokenPayload = {
  type: "demo_review_state";
  sessionId: string;
  anomalyStates: DemoReviewState["anomalyStates"];
  auditEvents: DemoReviewState["auditEvents"];
  issuedAt: string;
  expiresAt: string;
};

function reviewStateSecretKey() {
  return new TextEncoder().encode(getDemoAuthConfig().sessionSecret);
}

export async function readDemoReviewStateCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REVIEW_STATE_COOKIE_NAME)?.value ?? null;
}

export function setDemoReviewStateCookie(
  response: NextResponse,
  sessionId: string,
  reviewState: DemoReviewState,
) {
  const config = getDemoAuthConfig();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + config.sessionMaxAgeHours * 60 * 60 * 1000);
  const payload: DemoReviewStateTokenPayload = {
    type: "demo_review_state",
    sessionId,
    anomalyStates: reviewState.anomalyStates,
    auditEvents: reviewState.auditEvents,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(reviewStateSecretKey())
    .then((token) => {
      response.cookies.set(REVIEW_STATE_COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: config.sessionMaxAgeHours * 60 * 60,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    });
}

export function clearDemoReviewStateCookie(response: NextResponse) {
  response.cookies.set(REVIEW_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function loadDemoReviewState(sessionId: string): Promise<DemoReviewState> {
  const token = await readDemoReviewStateCookie();
  if (!token) {
    return createInitialDemoReviewState();
  }

  try {
    const { payload } = await jwtVerify(token, reviewStateSecretKey(), {
      audience: getDemoAuthConfig().audience,
      issuer: getDemoAuthConfig().issuer,
    });

    if (
      payload.type !== "demo_review_state" ||
      typeof payload.sessionId !== "string" ||
      payload.sessionId !== sessionId ||
      typeof payload.issuedAt !== "string" ||
      typeof payload.expiresAt !== "string" ||
      typeof payload.anomalyStates !== "object" ||
      payload.anomalyStates === null ||
      typeof payload.auditEvents !== "object" ||
      payload.auditEvents === null
    ) {
      return createInitialDemoReviewState();
    }

    return {
      anomalyStates: payload.anomalyStates as DemoReviewState["anomalyStates"],
      auditEvents: payload.auditEvents as DemoReviewState["auditEvents"],
    };
  } catch {
    return createInitialDemoReviewState();
  }
}

