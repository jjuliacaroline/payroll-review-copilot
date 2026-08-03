import { NextResponse } from "next/server";
import { createDemoSessionToken } from "@/lib/auth/session-token";
import { setDemoSessionCookie } from "@/lib/auth/session-cookie";
import { createId } from "@/lib/utils/id";

const PORTFOLIO_GUEST_LABEL = "Portfolio Guest";

export async function POST(request: Request) {
  const session = await createDemoSessionToken({
    reviewerLabel: PORTFOLIO_GUEST_LABEL,
    sessionId: createId("session"),
  });

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  setDemoSessionCookie(response, session.token);

  return response;
}
