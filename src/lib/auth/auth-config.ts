const DEMO_ISSUER = "payroll-review-copilot" as const;
const DEMO_AUDIENCE = "demo-access" as const;
const DEMO_SESSION_COOKIE_NAME = "payroll_review_demo_session" as const;
const DEFAULT_DEMO_INVITE_MAX_AGE_HOURS = 72;
const DEFAULT_DEMO_SESSION_MAX_AGE_HOURS = 12;

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePositiveInteger(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }

  return parsed;
}

function getBaseUrl() {
  return process.env.DEMO_BASE_URL?.trim() ?? "";
}

export function getDemoAuthConfig() {
  return {
    audience: DEMO_AUDIENCE,
    baseUrl: getBaseUrl(),
    cookieName: DEMO_SESSION_COOKIE_NAME,
    inviteMaxAgeHours: parsePositiveInteger(
      "DEMO_INVITE_MAX_AGE_HOURS",
      DEFAULT_DEMO_INVITE_MAX_AGE_HOURS,
    ),
    inviteSecret: requireEnv("DEMO_INVITE_SECRET"),
    issuer: DEMO_ISSUER,
    sessionMaxAgeHours: parsePositiveInteger(
      "DEMO_SESSION_MAX_AGE_HOURS",
      DEFAULT_DEMO_SESSION_MAX_AGE_HOURS,
    ),
    sessionSecret: requireEnv("DEMO_SESSION_SECRET"),
  };
}

export {
  DEMO_AUDIENCE,
  DEMO_ISSUER,
  DEMO_SESSION_COOKIE_NAME,
  DEFAULT_DEMO_INVITE_MAX_AGE_HOURS,
  DEFAULT_DEMO_SESSION_MAX_AGE_HOURS,
};
