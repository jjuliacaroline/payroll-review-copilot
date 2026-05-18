import { AccessStateCard } from "@/components/auth/access-state-card";
import { AccessStatusPanel } from "@/components/auth/access-status-panel";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { redirect } from "next/navigation";

type AccessPageProps = {
  searchParams?: {
    token?: string | string[];
  };
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const token = Array.isArray(searchParams?.token)
    ? searchParams?.token[0]
    : searchParams?.token;

  if (token) {
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
