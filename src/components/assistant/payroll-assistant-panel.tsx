"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PayrollRunSummary } from "@/lib/payroll/summary";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";
import { assistantPrompts } from "@/lib/assistant/prompts";
import type { AssistantPromptId, AssistantResponse } from "@/lib/assistant/types";
import { respondToAssistantPrompt } from "@/lib/assistant/respond";
import PromptChipList from "./prompt-chip-list";
import AssistantResponseCard from "./assistant-response-card";

type PayrollAssistantPanelProps = {
  summary: PayrollRunSummary;
  cards: AnomalyReviewCardViewModel[];
};

export default function PayrollAssistantPanel({ summary, cards }: PayrollAssistantPanelProps) {
  const [activePromptId, setActivePromptId] = useState<AssistantPromptId | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleSelect(promptId: AssistantPromptId) {
    setActivePromptId(promptId);
    setIsLoading(true);
    setResponse(null);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const nextResponse = respondToAssistantPrompt({
        promptId,
        summary,
        cards,
      });
      setResponse(nextResponse);
      setIsLoading(false);
      timeoutRef.current = null;
    }, 350);
  }

  return (
    <section aria-labelledby="assistant-panel-title" className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assistant</p>
        <h2 id="assistant-panel-title" className="mt-2 text-xl font-semibold text-slate-950">
          Payroll AI guidance
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Deterministic suggestions based on the current demo state. No external model calls.
        </p>
        <div className="mt-4">
          <PromptChipList
            prompts={assistantPrompts}
            activePromptId={activePromptId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {isLoading ? (
        <div
          aria-live="polite"
          className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-600"
        >
          Drafting a response...
        </div>
      ) : null}

      {!isLoading && response ? <AssistantResponseCard response={response} cards={cards} /> : null}

      {!isLoading && !response ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-600">
          Choose a prompt to see the assistant summary.
        </div>
      ) : null}
    </section>
  );
}
