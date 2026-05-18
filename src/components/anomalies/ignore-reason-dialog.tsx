"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { getIgnoreReasonLabel } from "@/lib/audit/labels";
import type { IgnoreReasonCode } from "@/lib/audit/types";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

const reasonCodes: IgnoreReasonCode[] = [
  "false_positive",
  "already_resolved_outside_system",
  "customer_confirmed_exception",
  "not_relevant_for_this_run",
];

type IgnoreReasonDialogProps = {
  card: AnomalyReviewCardViewModel | null;
  open: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (input: { reasonCode: IgnoreReasonCode; note?: string }) => void;
};

export default function IgnoreReasonDialog({
  card,
  open,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: IgnoreReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState<IgnoreReasonCode | "">("");
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedReason("");
      setNote("");
      setValidationError(null);
    }
  }, [open]);

  const noteLength = note.trim().length;
  const canSubmit = useMemo(() => Boolean(selectedReason) && !isSaving, [isSaving, selectedReason]);

  if (!open || !card) {
    return null;
  }

  function handleSubmit() {
    if (!selectedReason) {
      setValidationError("Select a reason before continuing.");
      return;
    }

    setValidationError(null);
    onSubmit({
      reasonCode: selectedReason,
      note: note.trim() ? note.trim().slice(0, 240) : undefined,
    });
  }

  return (
    <div
      aria-label="Ignore with reason"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Ignore with reason
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {card.anomaly.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Select a reason and optionally add a short note for the audit trail.
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-900">Reason</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {reasonCodes.map((reasonCode) => (
                <label
                  key={reasonCode}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <input
                    checked={selectedReason === reasonCode}
                    className="mt-1"
                    name="ignore-reason"
                    type="radio"
                    value={reasonCode}
                    onChange={() => setSelectedReason(reasonCode)}
                  />
                  <span>
                    <span className="block font-medium text-slate-900">{getIgnoreReasonLabel(reasonCode)}</span>
                    <span className="mt-1 block text-sm text-slate-500">{reasonCode}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900">Note</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              maxLength={240}
              placeholder="Optional note for the audit trail"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              {validationError ? <p className="text-sm text-rose-700">{validationError}</p> : null}
              {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
              <p className="text-xs text-slate-500">{noteLength}/240 characters</p>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSubmit}
                type="button"
                onClick={handleSubmit}
              >
                {isSaving ? "Saving..." : "Ignore anomaly"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
