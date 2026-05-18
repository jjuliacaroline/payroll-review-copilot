import { getDemoAuthConfig } from "./auth-config";

export function buildDemoInviteUrl(token: string) {
  const config = getDemoAuthConfig();
  const baseUrl = config.baseUrl;
  if (!baseUrl) {
    throw new Error("Missing DEMO_BASE_URL");
  }

  const url = new URL("/access", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
