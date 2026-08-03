import React from "react";
import Link from "next/link";

type TopbarProps = {
  reviewerLabel: string;
};

const PORTFOLIO_GUEST_LABEL = "Portfolio Guest";

export default function Topbar({ reviewerLabel }: TopbarProps) {
  const isGuestDemo = reviewerLabel === PORTFOLIO_GUEST_LABEL;

  return (
    <div className="mx-auto mb-6 max-w-6xl space-y-3">
      {isGuestDemo ? (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <span className="font-medium">Demo mode · Synthetic data</span>
          <Link className="font-semibold underline underline-offset-4" href="/logout">
            Leave demo
          </Link>
        </div>
      ) : null}

      <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Payroll Review Copilot
          </p>
          <p className="mt-1 text-sm text-slate-600">Signed in as {reviewerLabel}</p>
        </div>
        <Link
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          href="/logout"
        >
          {isGuestDemo ? "Restart demo" : "Log out"}
        </Link>
      </header>
    </div>
  );
}
