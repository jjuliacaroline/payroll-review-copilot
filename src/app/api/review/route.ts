import { NextRequest, NextResponse } from "next/server";
import { demoAnomalies } from "@/lib/demo-data";
import { DEMO_SESSION_COOKIE_NAME } from "@/lib/auth/auth-config";
import { verifyDemoSessionToken } from "@/lib/auth/session-token";
import { loadDemoReviewState, setDemoReviewStateCookie } from "@/lib/review-state/session-state";
import { applyReviewMutation, ReviewMutationError } from "@/lib/review-state/actions";
import { isIgnoreReasonCode } from "@/lib/audit/labels";
import type { IgnoreReasonCode } from "@/lib/audit/types";

function tryParseOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function collectTrustedOrigins(request: NextRequest) {
  const trustedOrigins = new Set<string>();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");

  if (forwardedProto && forwardedHost) {
    const origin = tryParseOrigin(`${forwardedProto}://${forwardedHost}`);
    if (origin) {
      trustedOrigins.add(origin);
    }
  }

  if (host) {
    const origin = tryParseOrigin(`${request.nextUrl.protocol}//${host}`);
    if (origin) {
      trustedOrigins.add(origin);
    }
  }

  trustedOrigins.add(request.nextUrl.origin);
  return trustedOrigins;
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const headerOrigin = tryParseOrigin(origin);
  if (!headerOrigin) {
    return false;
  }

  return collectTrustedOrigins(request).has(headerOrigin);
}

function readCookieFromHeader(request: NextRequest, name: string) {
  const parsedValue = request.cookies.get(name)?.value;
  if (parsedValue) {
    return parsedValue;
  }

  const rawCookieHeader = request.headers.get("cookie");
  if (!rawCookieHeader) {
    return null;
  }

  const matchingValues = rawCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${name}=`))
    .map((part) => decodeURIComponent(part.slice(name.length + 1)))
    .filter(Boolean);

  return matchingValues.at(-1) ?? null;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    console.error("review.invalid_origin", {
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
      nextUrlOrigin: request.nextUrl.origin,
      trustedOrigins: [...collectTrustedOrigins(request)],
    });
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const sessionToken = readCookieFromHeader(request, DEMO_SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return NextResponse.json({ error: "missing_session_cookie" }, { status: 401 });
  }

  let session;
  try {
    session = await verifyDemoSessionToken(sessionToken);
  } catch {
    return NextResponse.json({ error: "invalid_or_expired_session" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const anomalyId = typeof body === "object" && body !== null && "anomalyId" in body ? body.anomalyId : "";
  const action = typeof body === "object" && body !== null && "action" in body ? body.action : "";

  if (typeof anomalyId !== "string" || typeof action !== "string") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (
    action !== "mark_as_reviewed" &&
    action !== "ask_customer" &&
    action !== "generate_customer_message" &&
    action !== "mark_customer_message_sent" &&
    action !== "ignore_with_reason"
  ) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  try {
    const payload = body as Record<string, unknown>;
    const draftId =
      "draftId" in payload && typeof payload.draftId === "string"
        ? payload.draftId
        : undefined;
    const tone =
      "tone" in payload && (payload.tone === "neutral" || payload.tone === "polite_urgent")
        ? payload.tone
        : undefined;
    const generatedAt =
      "generatedAt" in payload && typeof payload.generatedAt === "string"
        ? payload.generatedAt
        : undefined;
    const reason =
      "reason" in payload && typeof payload.reason === "string" ? payload.reason : undefined;
    const note = "note" in payload && typeof payload.note === "string" ? payload.note : undefined;
    const reasonCode: IgnoreReasonCode | undefined =
      action === "ignore_with_reason" && reason && isIgnoreReasonCode(reason)
        ? reason
        : undefined;

    if (action === "ignore_with_reason") {
      if (!reasonCode) {
        return NextResponse.json({ error: "invalid_ignore_reason" }, { status: 400 });
      }

      if (note && note.length > 240) {
        return NextResponse.json({ error: "invalid_note" }, { status: 400 });
      }
    }

    const currentState = await loadDemoReviewState(session.sessionId);
    const nextState = applyReviewMutation({
      session,
      currentState,
      anomalies: demoAnomalies,
      request: {
        anomalyId,
        action,
        draftId,
        tone,
        generatedAt,
        reason: reasonCode,
        note: action === "ignore_with_reason" && note ? note : undefined,
      },
    });

    const response = NextResponse.json({ ok: true });
    await setDemoReviewStateCookie(response, session.sessionId, nextState);
    return response;
  } catch (error) {
    if (error instanceof ReviewMutationError) {
      const status =
        error.code === "unauthenticated"
          ? 401
          : error.code === "invalid_origin"
            ? 403
            : error.code === "invalid_anomaly_id" ||
                error.code === "invalid_action" ||
                error.code === "invalid_ignore_reason" ||
                error.code === "invalid_note"
              ? 400
              : 409;

      return NextResponse.json({ error: error.code }, { status });
    }

    return NextResponse.json({ error: "review_update_failed" }, { status: 500 });
  }
}
