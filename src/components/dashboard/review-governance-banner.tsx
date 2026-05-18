import React from "react";

const governancePoints = [
  "AI suggests",
  "Human reviews",
  "Human approves",
  "All decisions are logged",
];

export default function ReviewGovernanceBanner() {
  return (
    <div className="rounded-3xl border border-slate-900/10 bg-slate-900 px-6 py-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Governance
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            You stay in control of every payroll decision.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            The assistant highlights what needs attention, but the specialist remains the final
            authority.
          </p>
        </div>
        <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 sm:grid-cols-2">
          {governancePoints.map((point) => (
            <div key={point} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
