import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("debug_cookie", "hello", {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: false,
    maxAge: 60 * 60,
  });

  return response;
}
