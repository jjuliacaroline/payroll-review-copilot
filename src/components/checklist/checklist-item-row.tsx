import React from "react";
import type { ChecklistItem } from "@/lib/checklist/types";

const statusStyles: Record<ChecklistItem["status"], string> = {
  complete: "border-emerald-200 bg-emerald-100 text-emerald-900",
  incomplete: "border-amber-200 bg-amber-100 text-amber-900",
  blocked: "border-rose-200 bg-rose-100 text-rose-900",
};

const statusLabels: Record<ChecklistItem["status"], string> = {
  complete: "Complete",
  incomplete: "Incomplete",
  blocked: "Blocked",
};

type ChecklistItemRowProps = {
  item: ChecklistItem;
};

export default function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
          {item.detail ? <p className="mt-1 text-sm text-slate-600">{item.detail}</p> : null}
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
            statusStyles[item.status]
          }`}
        >
          {statusLabels[item.status]}
        </span>
      </div>
    </li>
  );
}
