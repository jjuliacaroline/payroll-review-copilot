"use client";

import React from "react";
type MessageDraftActionsProps = {
  canCopy: boolean;
  canSend: boolean;
  copyConfirmation: string | null;
  isCopying: boolean;
  isSending: boolean;
  onCopy: () => void;
  onImproveTone: () => void;
  onMarkAsSent: () => void;
  onClose: () => void;
  improveToneLabel: string;
};

export default function MessageDraftActions({
  canCopy,
  canSend,
  copyConfirmation,
  isCopying,
  isSending,
  onCopy,
  onImproveTone,
  onMarkAsSent,
  onClose,
  improveToneLabel,
}: MessageDraftActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          disabled={!canCopy || isCopying}
          type="button"
          onClick={onCopy}
        >
          {isCopying ? "Copying..." : "Copy message"}
        </button>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          disabled={isSending}
          type="button"
          onClick={onImproveTone}
        >
          {improveToneLabel}
        </button>
        <button
          className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          disabled={!canSend || isSending}
          type="button"
          onClick={onMarkAsSent}
        >
          {isSending ? "Saving..." : "Mark as sent"}
        </button>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      {copyConfirmation ? <p className="text-sm text-emerald-700">{copyConfirmation}</p> : null}
    </div>
  );
}
