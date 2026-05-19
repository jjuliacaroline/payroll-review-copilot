import React from "react";
import AnomalyCard from "./anomaly-card";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";
import type { AuditEvent } from "@/lib/audit/types";

type AnomalyListProps = {
  cards: AnomalyReviewCardViewModel[];
  auditEvents: AuditEvent[];
};

export default function AnomalyList({ cards, auditEvents }: AnomalyListProps) {
  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI anomaly review queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review the payroll issues flagged by the demo assistant.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">{cards.length} anomalies</p>
      </div>
      <div className="mt-6 grid gap-4">
        {cards.map((card) => (
          <AnomalyCard key={card.anomaly.id} card={card} auditEvents={auditEvents} />
        ))}
      </div>
    </section>
  );
}

