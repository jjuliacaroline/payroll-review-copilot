"use client";

import React from "react";
import type { CustomerMessageDraft } from "@/lib/messages/types";

type MessageDraftBodyProps = {
  draft: CustomerMessageDraft;
  generatedAtLabel: string;
};

export default function MessageDraftBody({ draft, generatedAtLabel }: MessageDraftBodyProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        <span>Finnish draft</span>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] tracking-[0.18em] text-slate-700">
          {draft.tone === "polite_urgent" ? "Polite urgent" : "Neutral"}
        </span>
        <span>{generatedAtLabel}</span>
      </div>
      {draft.subject ? (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Subject</p>
          <p className="text-sm font-medium text-slate-950">{draft.subject}</p>
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Message body</p>
        <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800">
          {draft.body}
        </pre>
      </div>
    </div>
  );
}
