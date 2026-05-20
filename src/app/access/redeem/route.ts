import { NextRequest, NextResponse } from "next/server";
import { createDemoSessionToken } from "@/lib/auth/session-token";
import { clearDemoSessionCookie, setDemoSessionCookie } from "@/lib/auth/session-cookie";
import { verifyDemoInviteToken } from "@/lib/auth/invite-token";
import { createId } from "@/lib/utils/id";

function isLikelyInviteToken(token: string) {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !isLikelyInviteToken(token)) {
    return NextResponse.redirect(new URL("/access/invalid", request.url));
  }

  try {
    const invite = await verifyDemoInviteToken(token);
    const session = await createDemoSessionToken({
      reviewerLabel: invite.reviewerLabel,
      sessionId: createId("session"),
    });

    const response = new NextResponse(
      `<!doctype html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/" />
          <title>Opening demo...</title>
        </head>
        <body>
          <p>Opening demo...</p>
          <script>window.location.replace("/");</script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );

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
