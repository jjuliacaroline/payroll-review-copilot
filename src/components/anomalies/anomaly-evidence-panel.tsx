import React from "react";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

type AnomalyEvidencePanelProps = {
  card: AnomalyReviewCardViewModel;
};

export default function AnomalyEvidencePanel({ card }: AnomalyEvidencePanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Evidence
        </h4>
        <p className="mt-2 text-sm leading-7 text-slate-700">{card.anomaly.evidence}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Suggested next step
        </h4>
        <p className="mt-2 text-sm leading-7 text-slate-700">{card.anomaly.suggestedNextAction}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Expanded explanation
        </h4>
        <p className="mt-2 text-sm leading-7 text-slate-700">{card.anomaly.explanation}</p>
      </div>
      {card.anomaly.previousMonthContext ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Previous month context
          </h4>
          <p className="mt-2 text-sm leading-7 text-slate-700">{card.anomaly.previousMonthContext}</p>
        </div>
      ) : null}
    </section>
  );
}
