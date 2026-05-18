import { NextRequest, NextResponse } from "next/server";
import { clearDemoSessionCookie } from "@/lib/auth/session-cookie";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/access/logged-out", request.url));
  clearDemoSessionCookie(response);
  return response;
}
