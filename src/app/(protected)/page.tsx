import { requireDemoSession } from "@/lib/auth/require-demo-session";

export default async function DashboardPage() {
  const session = await requireDemoSession();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
        Protected demo dashboard
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
        Payroll Review Copilot
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        This placeholder dashboard confirms that invite-based authentication is working. The
        authenticated session belongs to {session.reviewerLabel}.
      </p>
    </section>
  );
}
