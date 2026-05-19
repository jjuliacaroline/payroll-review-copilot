"use client";

import React from "react";
import type { AssistantPrompt, AssistantPromptId } from "@/lib/assistant/types";

type PromptChipListProps = {
  prompts: AssistantPrompt[];
  activePromptId: AssistantPromptId | null;
  onSelect: (promptId: AssistantPromptId) => void;
};

export default function PromptChipList({ prompts, activePromptId, onSelect }: PromptChipListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => {
        const isActive = activePromptId === prompt.id;
        return (
          <button
            key={prompt.id}
            aria-pressed={isActive}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            type="button"
            onClick={() => onSelect(prompt.id)}
          >
            {prompt.label}
          </button>
        );
      })}
    </div>
  );
}
