import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE_NAME, getDemoAuthConfig } from "./auth-config";

export function readDemoSessionCookie() {
  return cookies().get(DEMO_SESSION_COOKIE_NAME)?.value ?? null;
}

export function setDemoSessionCookie(response: NextResponse, token: string) {
  const config = getDemoAuthConfig();
  response.cookies.set(DEMO_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: config.sessionMaxAgeHours * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearDemoSessionCookie(response: NextResponse) {
  response.cookies.set(DEMO_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
