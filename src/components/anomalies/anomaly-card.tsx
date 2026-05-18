import React from "react";
import SeverityBadge from "./severity-badge";
import AnomalyStatusBadge from "./anomaly-status-badge";
import AnomalyActions from "./anomaly-actions";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

type AnomalyCardProps = {
  card: AnomalyReviewCardViewModel;
};

export default function AnomalyCard({ card }: AnomalyCardProps) {
  const headingId = `anomaly-${card.anomaly.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={card.anomaly.severity} />
            <AnomalyStatusBadge status={card.status} />
            {card.anomaly.blockingApproval ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700">
                Blocks approval
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              {card.employee.fullName} · {card.employee.roleTitle}
            </p>
            <h3 id={headingId} className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {card.anomaly.title}
            </h3>
          </div>
          <p className="text-sm leading-7 text-slate-700">{card.anomaly.explanation}</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Evidence
              </dt>
              <dd className="mt-2 text-sm leading-7 text-slate-700">{card.anomaly.evidence}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Suggested next action
              </dt>
              <dd className="mt-2 text-sm leading-7 text-slate-700">
                {card.anomaly.suggestedNextAction}
              </dd>
            </div>
          </dl>
          {card.anomaly.previousMonthContext ? (
            <p className="text-sm text-slate-500">
              Previous month: {card.anomaly.previousMonthContext}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 lg:w-[320px]">
          <AnomalyActions anomalyId={card.anomaly.id} currentStatus={card.status} />
        </div>
      </div>
    </article>
  );
}

