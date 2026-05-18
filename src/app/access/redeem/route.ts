import { NextRequest, NextResponse } from "next/server";
import { createDemoSessionToken } from "@/lib/auth/session-token";
import { clearDemoSessionCookie, setDemoSessionCookie } from "@/lib/auth/session-cookie";
import { verifyDemoInviteToken } from "@/lib/auth/invite-token";
import { createId } from "@/lib/utils/id";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/access/invalid", request.url));
  }

  try {
    const invite = await verifyDemoInviteToken(token);
    const session = await createDemoSessionToken({
      reviewerLabel: invite.reviewerLabel,
      sessionId: createId("session"),
    });

    const response = NextResponse.redirect(new URL("/", request.url));
    setDemoSessionCookie(response, session.token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const response = NextResponse.redirect(
      new URL(message === "demo_invite_expired" ? "/access/expired" : "/access/invalid", request.url),
    );
    clearDemoSessionCookie(response);
    return response;
  }
}
