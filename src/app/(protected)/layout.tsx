import Link from "next/link";
import type { ReactNode } from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireDemoSession();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Payroll Review Copilot
          </p>
          <p className="mt-1 text-sm text-slate-600">Signed in as {session.reviewerLabel}</p>
        </div>
        <Link
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          href="/logout"
        >
          Log out
        </Link>
      </header>
      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
