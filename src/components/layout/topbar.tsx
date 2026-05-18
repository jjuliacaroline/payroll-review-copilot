import React from "react";
import Link from "next/link";

type TopbarProps = {
  reviewerLabel: string;
};

export default function Topbar({ reviewerLabel }: TopbarProps) {
  return (
    <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
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
        Log out
      </Link>
    </header>
  );
}
