import { NextRequest, NextResponse } from "next/server";
import { demoAnomalies } from "@/lib/demo-data";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { loadDemoReviewState, setDemoReviewStateCookie } from "@/lib/review-state/session-state";
import { applyReviewMutation, ReviewMutationError } from "@/lib/review-state/actions";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const requestOrigin = new URL(request.nextUrl.origin ?? request.url);
    const headerOrigin = new URL(origin);

    const isLocalAlias = (hostname: string) =>
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (requestOrigin.protocol !== headerOrigin.protocol) {
      return false;
    }

    if (requestOrigin.port !== headerOrigin.port) {
      return false;
    }

    if (requestOrigin.hostname === headerOrigin.hostname) {
      return true;
    }

    return isLocalAlias(requestOrigin.hostname) && isLocalAlias(headerOrigin.hostname);
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

  if (action !== "mark_as_reviewed" && action !== "ask_customer") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
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
            : error.code === "invalid_anomaly_id" || error.code === "invalid_action"
              ? 400
              : 409;

      return NextResponse.json({ error: error.code }, { status });
    }

    return NextResponse.json({ error: "review_update_failed" }, { status: 500 });
  }
}
