"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnomalyStatus } from "@/lib/domain/types";
import type { ReviewMutationAction } from "@/lib/review-state/types";

type AnomalyActionsProps = {
  anomalyId: string;
  currentStatus: AnomalyStatus;
};

function actionLabel(action: ReviewMutationAction) {
  return action === "mark_as_reviewed" ? "Mark as reviewed" : "Ask customer";
}

export default function AnomalyActions({ anomalyId, currentStatus }: AnomalyActionsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reviewDisabled = isSaving || currentStatus === "reviewed";
  const askCustomerDisabled = isSaving || currentStatus === "waiting_for_customer";

  async function submit(action: ReviewMutationAction) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomalyId,
          action,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "review_update_failed");
      }

      router.refresh();
    } catch {
      setErrorMessage("Unable to save this action right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          disabled={reviewDisabled}
          type="button"
          onClick={() => submit("mark_as_reviewed")}
        >
          {isSaving && !reviewDisabled ? "Saving..." : actionLabel("mark_as_reviewed")}
        </button>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          disabled={askCustomerDisabled}
          type="button"
          onClick={() => submit("ask_customer")}
        >
          {isSaving && !askCustomerDisabled ? "Saving..." : actionLabel("ask_customer")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
          disabled
          title="Available in Step 5"
          type="button"
        >
          Review details
        </button>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
          disabled
          title="Available in Step 6"
          type="button"
        >
          Generate customer message
        </button>
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
          disabled
          title="Available in Step 5"
          type="button"
        >
          Ignore with reason
        </button>
      </div>
      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </div>
  );
}

