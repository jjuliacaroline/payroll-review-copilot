import React from "react";
import type { ChecklistItem } from "@/lib/checklist/types";
import ChecklistItemRow from "./checklist-item-row";

type PayrollReadinessChecklistProps = {
  items: ChecklistItem[];
};

export default function PayrollReadinessChecklist({
  items,
}: PayrollReadinessChecklistProps) {
  return (
    <section aria-labelledby="payroll-readiness-title">
      <div>
        <h2 id="payroll-readiness-title" className="text-lg font-semibold text-slate-900">
          Payroll readiness checklist
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Track the required approvals and blockers before final sign-off.
        </p>
      </div>
      <ul className="mt-6 grid gap-4" role="list">
        {items.map((item) => (
          <ChecklistItemRow key={item.key} item={item} />
        ))}
      </ul>
    </section>
  );
}
