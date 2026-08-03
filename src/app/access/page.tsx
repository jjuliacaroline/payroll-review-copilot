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
      title="Explore the payroll review demo"
      description="Enter the portfolio demo instantly with synthetic data, or use a signed invite link for a private demo session."
    >
      <form action="/access/guest" method="post">
        <button
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          type="submit"
        >
          Try the demo
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-slate-500">
        No account, password, email, or invite token required.
      </p>
      <div className="mt-6">
        <AccessStatusPanel
          items={[
            "The public demo uses synthetic payroll data.",
            "Private signed invite links still work as before.",
            "Demo sessions expire automatically.",
          ]}
        />
      </div>
    </AccessStateCard>
  );
}
