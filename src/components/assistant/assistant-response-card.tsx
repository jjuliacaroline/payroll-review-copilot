import React from "react";
import type { AssistantResponse } from "@/lib/assistant/types";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

type AssistantResponseCardProps = {
  response: AssistantResponse;
  cards: AnomalyReviewCardViewModel[];
};

export default function AssistantResponseCard({ response, cards }: AssistantResponseCardProps) {
  const related = response.relatedAnomalyIds
    ? cards.filter((card) => response.relatedAnomalyIds?.includes(card.anomaly.id))
    : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Assistant response
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{response.title}</h3>
        </div>
        <time
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          dateTime={response.generatedAt}
        >
          Generated just now
        </time>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{response.body}</p>
      {related.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Related anomalies
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {related.map((card) => (
              <li key={card.anomaly.id}>
                {card.anomaly.title} · {card.employee.fullName}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
