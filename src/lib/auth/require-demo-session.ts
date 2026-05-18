import { redirect } from "next/navigation";
import { readDemoSessionCookie } from "./session-cookie";
import { verifyDemoSessionToken } from "./session-token";
import type { DemoSessionPayload } from "./types";

export async function getOptionalDemoSession(): Promise<DemoSessionPayload | null> {
  const token = readDemoSessionCookie();
  if (!token) {
    return null;
  }

  try {
    return await verifyDemoSessionToken(token);
  } catch {
    return null;
  }
}

export async function requireDemoSession(): Promise<DemoSessionPayload> {
  const session = await getOptionalDemoSession();
  if (!session) {
    redirect("/access");
  }

  return session;
}
