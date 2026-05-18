import { NextRequest, NextResponse } from "next/server";
import { demoAnomalies } from "@/lib/demo-data";
import { getDemoAuthConfig } from "@/lib/auth/auth-config";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { loadDemoReviewState, setDemoReviewStateCookie } from "@/lib/review-state/session-state";
import { applyReviewMutation, ReviewMutationError } from "@/lib/review-state/actions";
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

function isIgnoreReasonCode(value: unknown): value is IgnoreReasonCode {
  return (
    value === "false_positive" ||
    value === "already_resolved_outside_system" ||
    value === "customer_confirmed_exception" ||
    value === "not_relevant_for_this_run"
  );
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
  const reasonCode =
    typeof body === "object" && body !== null && "reasonCode" in body ? body.reasonCode : undefined;
  const note = typeof body === "object" && body !== null && "note" in body ? body.note : undefined;

  if (typeof anomalyId !== "string" || typeof action !== "string") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (action !== "mark_as_reviewed" && action !== "ask_customer" && action !== "open_detail" && action !== "ignore_with_reason") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  if (action === "ignore_with_reason" && !isIgnoreReasonCode(reasonCode)) {
    return NextResponse.json({ error: "invalid_reason_code" }, { status: 400 });
  }

  try {
    const currentState = await loadDemoReviewState(session.sessionId);
    const nextState = applyReviewMutation({
      session,
      currentState,
      anomalies: demoAnomalies,
      request: {
        anomalyId,
        action,
        reasonCode: isIgnoreReasonCode(reasonCode) ? reasonCode : undefined,
        note: typeof note === "string" ? note : undefined,
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
            : error.code === "invalid_anomaly_id" || error.code === "invalid_action" || error.code === "invalid_reason_code"
              ? 400
              : 409;

      return NextResponse.json({ error: error.code }, { status });
    }

    return NextResponse.json({ error: "review_update_failed" }, { status: 500 });
  }
}
