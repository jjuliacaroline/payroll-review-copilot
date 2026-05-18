"use client";

import React from "react";
import { useEffect, useRef } from "react";
import AnomalyStatusBadge from "./anomaly-status-badge";
import SeverityBadge from "./severity-badge";
import AnomalyEvidencePanel from "./anomaly-evidence-panel";
import ActionHistoryInline from "./action-history-inline";
import type { AuditEvent } from "@/lib/audit/types";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

type AnomalyDetailDrawerProps = {
  card: AnomalyReviewCardViewModel;
  events: AuditEvent[];
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onMarkReviewed: () => void;
  onIgnoreWithReason: () => void;
};

export default function AnomalyDetailDrawer({
  card,
  events,
  open,
  isSaving,
  onClose,
  onMarkReviewed,
  onIgnoreWithReason,
}: AnomalyDetailDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    return undefined;
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-label={`${card.anomaly.title} details`}
      aria-modal="true"
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/50"
      role="dialog"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-4xl overflow-y-auto border-l border-slate-200 bg-slate-50 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
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
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {card.anomaly.title}
                </h3>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <AnomalyEvidencePanel card={card} />

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSaving || card.status === "reviewed"}
                type="button"
                onClick={onMarkReviewed}
              >
                {isSaving && card.status !== "reviewed" ? "Saving..." : "Mark as reviewed"}
              </button>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                disabled={isSaving}
                type="button"
                onClick={onIgnoreWithReason}
              >
                Ignore with reason
              </button>
            </div>

            <ActionHistoryInline events={events} />
          </div>
        </div>
      </aside>
    </div>
  );
}
