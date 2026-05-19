"use client";

import React, { useEffect } from "react";
import type { CustomerMessageDraft } from "@/lib/messages/types";
import MessageDraftActions from "./message-draft-actions";
import MessageDraftBody from "./message-draft-body";

type MessageDraftModalProps = {
  open: boolean;
  draft: CustomerMessageDraft | null;
  generatedAtLabel: string;
  copyConfirmation: string | null;
  isCopying: boolean;
  isSending: boolean;
  improveToneLabel: string;
  canCopy: boolean;
  canSend: boolean;
  onClose: () => void;
  onCopy: () => void;
  onImproveTone: () => void;
  onMarkAsSent: () => void;
};

export default function MessageDraftModal({
  open,
  draft,
  generatedAtLabel,
  copyConfirmation,
  isCopying,
  isSending,
  improveToneLabel,
  canCopy,
  canSend,
  onClose,
  onCopy,
  onImproveTone,
  onMarkAsSent,
}: MessageDraftModalProps) {
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

  if (!open || !draft) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      aria-labelledby="message-draft-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_40px_120px_rgba(15,23,42,0.28)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Customer message draft
            </p>
            <h2 id="message-draft-modal-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Review before sending
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
        <div className="mt-6 space-y-6">
          <MessageDraftBody draft={draft} generatedAtLabel={generatedAtLabel} />
          <MessageDraftActions
            canCopy={canCopy}
            canSend={canSend}
            copyConfirmation={copyConfirmation}
            isCopying={isCopying}
            isSending={isSending}
            improveToneLabel={improveToneLabel}
            onClose={onClose}
            onCopy={onCopy}
            onImproveTone={onImproveTone}
            onMarkAsSent={onMarkAsSent}
          />
        </div>
      </div>
    </div>
  );
}
