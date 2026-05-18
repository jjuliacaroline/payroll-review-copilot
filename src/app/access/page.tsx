import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { redirect } from "next/navigation";

type AccessPageProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

function isLikelyInviteToken(token: string) {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const token = Array.isArray(resolvedSearchParams?.token)
    ? resolvedSearchParams?.token[0]
    : resolvedSearchParams?.token;

  if (typeof token === "string") {
    if (!isLikelyInviteToken(token)) {
      redirect("/access/invalid");
    }

    redirect(`/access/redeem?token=${encodeURIComponent(token)}`);
  }

  const session = await getOptionalDemoSession();
  if (session) {
    redirect("/");
  }

  return (
    <AccessStateCard
      eyebrow="Payroll Review Copilot"
      title="Demo access required"
      description="Access is granted through a secure invite link. There is no password prompt and no account creation."
    >
      <AccessStatusPanel
        items={[
          "Open the private invite link you received.",
          "The link is signed and expires automatically.",
          "If the link is no longer valid, request a fresh invite.",
        ]}
      />
    </AccessStateCard>
  );
}
