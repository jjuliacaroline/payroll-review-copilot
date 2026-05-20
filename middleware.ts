import { NextRequest, NextResponse } from "next/server";
import { verifyDemoSessionToken } from "@/lib/auth/session-token";
import { clearDemoSessionCookie } from "@/lib/auth/session-cookie";
import { DEMO_SESSION_COOKIE_NAME } from "@/lib/auth/auth-config";

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

  if (token) {
    const redeemUrl = new URL("/access/redeem", request.url);
    redeemUrl.searchParams.set("token", token);

    const response = NextResponse.redirect(redeemUrl);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

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
