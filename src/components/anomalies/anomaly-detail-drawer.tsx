"use client";

import { useEffect } from "react";
import SeverityBadge from "./severity-badge";
import AnomalyStatusBadge from "./anomaly-status-badge";
import AnomalyEvidencePanel from "./anomaly-evidence-panel";
import ActionHistoryInline from "./action-history-inline";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";
import type { AuditEvent } from "@/lib/audit/types";
import { getIgnoreReasonLabel } from "@/lib/audit/labels";

type AnomalyDetailDrawerProps = {
  open: boolean;
  card: AnomalyReviewCardViewModel;
  auditEvents: AuditEvent[];
  isSaving: boolean;
  onClose: () => void;
  onMarkReviewed: () => void;
  onAskCustomer: () => void;
  onOpenIgnoreDialog: () => void;
};

export default function AnomalyDetailDrawer({
  open,
  card,
  auditEvents,
  isSaving,
  onClose,
  onMarkReviewed,
  onAskCustomer,
  onOpenIgnoreDialog,
}: AnomalyDetailDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const reviewDisabled = isSaving || card.status === "reviewed";
  const askCustomerDisabled = isSaving || card.status === "waiting_for_customer";
  const ignoreDisabled =
    isSaving || card.status === "ignored" || card.status === "reviewed" || card.status === "message_sent";

  return (
    <div
      aria-modal="true"
      aria-labelledby="anomaly-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside className="h-full w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_40px_120px_rgba(15,23,42,0.28)] sm:h-[90vh] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Anomaly detail
            </p>
            <h2 id="anomaly-detail-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {card.anomaly.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {card.employee.fullName} · {card.employee.roleTitle}
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={card.anomaly.severity} />
            <AnomalyStatusBadge status={card.status} />
            {card.anomaly.blockingApproval ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700">
                Blocks approval
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-7 text-slate-700">{card.anomaly.explanation}</p>
          <AnomalyEvidencePanel anomaly={card.anomaly} employee={card.employee} />
          {card.status === "ignored" && card.ignoredReason ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <span className="font-semibold">Ignored reason:</span> {getIgnoreReasonLabel(card.ignoredReason)}
            </div>
          ) : null}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Human review actions
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                disabled={reviewDisabled}
                type="button"
                onClick={onMarkReviewed}
              >
                {isSaving && !reviewDisabled ? "Saving..." : "Mark as reviewed"}
              </button>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                disabled={askCustomerDisabled}
                type="button"
                onClick={onAskCustomer}
              >
                {isSaving && !askCustomerDisabled ? "Saving..." : "Ask customer"}
              </button>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                disabled={ignoreDisabled}
                type="button"
                onClick={onOpenIgnoreDialog}
              >
                Ignore with reason
              </button>
            </div>
          </div>
          <ActionHistoryInline events={auditEvents} />
        </div>
      </aside>
    </div>
  );
}
