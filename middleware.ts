import { NextRequest, NextResponse } from "next/server";
import { createDemoSessionToken, verifyDemoSessionToken } from "@/lib/auth/session-token";
import {
  clearDemoSessionCookie,
  DEMO_SESSION_COOKIE_NAME,
  setDemoSessionCookie,
} from "@/lib/auth/session-cookie";
import { verifyDemoInviteToken } from "@/lib/auth/invite-token";
import { createId } from "@/lib/utils/id";

const PUBLIC_ACCESS_PATHS = new Set([
  "/access",
  "/access/invalid",
  "/access/expired",
  "/access/session-expired",
  "/access/logged-out",
  "/access/redeem",
  "/logout",
]);

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/images");
}

async function handleAccessRoute(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const existingSession = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value;
    if (!existingSession) {
      return NextResponse.next();
    }

    try {
      await verifyDemoSessionToken(existingSession);
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      const response = NextResponse.redirect(
        new URL(
          error instanceof Error && error.message === "demo_session_expired"
            ? "/access/session-expired"
            : "/access/invalid",
          request.url,
        ),
      );
      clearDemoSessionCookie(response);
      return response;
    }
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
    const pathname =
      message === "demo_invite_expired" ? "/access/expired" : "/access/invalid";
    return NextResponse.redirect(new URL(pathname, request.url));
  }
}

async function handleProtectedRoute(request: NextRequest) {
  const sessionToken = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/access", request.url));
  }

  try {
    await verifyDemoSessionToken(sessionToken);
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(
      new URL(
        error instanceof Error && error.message === "demo_session_expired"
          ? "/access/session-expired"
          : "/access/invalid",
        request.url,
      ),
    );
    clearDemoSessionCookie(response);
    return response;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_ACCESS_PATHS.has(pathname)) {
    if (pathname === "/access") {
      return handleAccessRoute(request);
    }

    return NextResponse.next();
  }

  return handleProtectedRoute(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
