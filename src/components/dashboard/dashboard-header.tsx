import React from "react";
import type { PayrollRunSummary } from "@/lib/payroll/summary";
import { formatFinnishDate } from "@/lib/format/date";
import { formatNumber } from "@/lib/format/number";

const statusCopy = {
  review_in_progress: {
    label: "Review in progress",
    className: "bg-amber-100 text-amber-900 border-amber-200",
  },
  ready_for_approval: {
    label: "Ready for approval",
    className: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
} as const;

type DashboardHeaderProps = {
  summary: PayrollRunSummary;
};

export default function DashboardHeader({ summary }: DashboardHeaderProps) {
  const status = statusCopy[summary.status];

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Payroll run
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {summary.companyName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{summary.payrollPeriodLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Payment date
          </p>
          <p className="mt-1 text-base font-medium text-slate-900">
            Payment date {formatFinnishDate(summary.paymentDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Employees
          </p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {formatNumber(summary.employeeCount)} employees
          </p>
        </div>
      </div>
    </div>
  );
}
