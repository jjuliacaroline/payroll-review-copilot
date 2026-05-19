import React from "react";
import type { ChecklistItem } from "@/lib/checklist/types";

const statusStyles: Record<ChecklistItem["status"], string> = {
  complete: "border-emerald-200 bg-emerald-100 text-emerald-900",
  incomplete: "border-amber-200 bg-amber-100 text-amber-900",
  blocked: "border-rose-200 bg-rose-100 text-rose-900",
};

type ApprovalStatusCardProps = {
  item: ChecklistItem;
};

export default function ApprovalStatusCard({ item }: ApprovalStatusCardProps) {
  const isReady = item.status === "complete";
  const statusLabel = isReady ? "Ready" : "Not ready";
  const headline = isReady ? "Ready for approval" : "Not ready for approval";
  const detail =
    item.detail ??
    (isReady
      ? "All checklist items are complete. Payroll is ready for approval."
      : "Resolve the remaining checklist items before approval.");

  return (
    <section
      aria-labelledby="approval-status-title"
      className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Approval status
      </p>
      <h2 id="approval-status-title" className="mt-2 text-xl font-semibold text-slate-950">
        {headline}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
      <div className="mt-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
            statusStyles[item.status]
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </section>
  );
}
