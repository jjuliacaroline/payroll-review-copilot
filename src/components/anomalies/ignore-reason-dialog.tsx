"use client";

import { useEffect, useState } from "react";
import type { IgnoreReasonCode } from "@/lib/audit/types";
import { getIgnoreReasonLabel, ignoreReasonOptions } from "@/lib/audit/labels";

type IgnoreReasonDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (reason: IgnoreReasonCode, note?: string) => void;
};

export default function IgnoreReasonDialog({
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: IgnoreReasonDialogProps) {
  const [reason, setReason] = useState<IgnoreReasonCode | "">("");
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");
    setNote("");
    setLocalError(null);
  }, [open]);

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

  return (
    <div
      aria-modal="true"
      aria-labelledby="ignore-reason-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_40px_120px_rgba(15,23,42,0.28)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Ignore anomaly
            </p>
            <h2 id="ignore-reason-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Capture the decision reason
            </h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setLocalError(null);
            if (!reason) {
              setLocalError("Select one reason before continuing.");
              return;
            }
            onSubmit(reason, note.trim() ? note.trim() : undefined);
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-900">Reason for ignoring</legend>
            <div className="grid gap-2">
              {ignoreReasonOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    reason === option.value
                      ? "border-slate-900 bg-slate-900/5 text-slate-900"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    checked={reason === option.value}
                    className="h-4 w-4"
                    name="ignore-reason"
                    type="radio"
                    value={option.value}
                    onChange={() => setReason(option.value)}
                  />
                  <span>{getIgnoreReasonLabel(option.value)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Optional note</span>
            <textarea
              className="h-28 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              maxLength={240}
              placeholder="Add any context for the audit trail."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {localError ? <p className="text-sm text-rose-700">{localError}</p> : null}
          {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Ignore anomaly"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
