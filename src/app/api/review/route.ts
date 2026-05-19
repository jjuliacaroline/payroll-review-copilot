import { NextRequest, NextResponse } from "next/server";
import { demoAnomalies } from "@/lib/demo-data";
import { getDemoAuthConfig } from "@/lib/auth/auth-config";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { loadDemoReviewState, setDemoReviewStateCookie } from "@/lib/review-state/session-state";
import { applyReviewMutation, ReviewMutationError } from "@/lib/review-state/actions";
import { isIgnoreReasonCode } from "@/lib/audit/labels";
import type { IgnoreReasonCode } from "@/lib/audit/types";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    const config = getDemoAuthConfig();
    if (!config.baseUrl) {
      return false;
    }

    const trustedOrigin = new URL(config.baseUrl).origin;
    const headerOrigin = new URL(origin);

    return headerOrigin.origin === trustedOrigin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const session = await getOptionalDemoSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
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
