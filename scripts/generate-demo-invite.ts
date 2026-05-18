import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createDemoInviteToken } from "../src/lib/auth/invite-token";
import { buildDemoInviteUrl } from "../src/lib/auth/invite-url";
import { createId } from "../src/lib/utils/id";

function loadEnvFile(path: string) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^"(.*)"$/, "$1");
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnvironment() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  loadEnvFile(resolve(process.cwd(), ".env"));
}

function getArgValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getOptionalNumberArg(name: string) {
  const value = getArgValue(name);
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric value for ${name}`);
  }

  return parsed;
}

async function main() {
  loadLocalEnvironment();

  const reviewerLabel = getArgValue("--reviewer") ?? "Demo Reviewer";
  const maxAgeHours = getOptionalNumberArg("--hours");
  const inviteId = createId("invite");

  const { token, expiresInHours } = await createDemoInviteToken({
    inviteId,
    maxAgeHours: maxAgeHours ?? undefined,
    reviewerLabel,
  });

  const url = buildDemoInviteUrl(token);

  console.log(`Reviewer: ${reviewerLabel}`);
  console.log(`Invite ID: ${inviteId}`);
  console.log(`Expires in: ${expiresInHours} hours`);
  console.log(url);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
