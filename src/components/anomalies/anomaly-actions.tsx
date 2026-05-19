"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnomalyStatus } from "@/lib/domain/types";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";
import type { CustomerMessageDraft, MessageTone } from "@/lib/messages/types";
import { generateCustomerMessageDraft } from "@/lib/messages/generate-draft";
import { isMessageableAnomalyType } from "@/lib/messages/types";
import { createId } from "@/lib/utils/id";
import MessageDraftModal from "@/components/messages/message-draft-modal";
import type { ReviewMutationAction } from "@/lib/review-state/types";

type AnomalyActionsProps = {
  card: AnomalyReviewCardViewModel;
};

function actionLabel(action: ReviewMutationAction) {
  return action === "mark_as_reviewed" ? "Mark as reviewed" : "Ask customer";
}

async function writeTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function AnomalyActions({ card }: AnomalyActionsProps) {
  const router = useRouter();
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyConfirmation, setCopyConfirmation] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomerMessageDraft | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const currentStatus = card.status as AnomalyStatus;
  const reviewDisabled = isSavingReview || currentStatus === "reviewed";
  const askCustomerDisabled = isSavingReview || currentStatus === "waiting_for_customer";
  const canUseMessageFlow = isMessageableAnomalyType(card.anomaly.type);
  const canOpenMessageDraft =
    canUseMessageFlow && currentStatus !== "reviewed" && currentStatus !== "ignored";
  const draftTone: MessageTone = draft?.tone ?? card.messageTone ?? "neutral";
  const improveToneLabel = draftTone === "neutral" ? "Improve tone" : "Make tone neutral";

  async function submit(action: ReviewMutationAction) {
    setIsSavingReview(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomalyId: card.anomaly.id,
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
      setIsSavingReview(false);
    }
  }

  async function persistCustomerMessage(action: "generate_customer_message" | "mark_customer_message_sent", nextDraft?: CustomerMessageDraft) {
    const payload =
      action === "generate_customer_message" && nextDraft
        ? {
            anomalyId: card.anomaly.id,
            action,
            draftId: nextDraft.id,
            tone: nextDraft.tone,
            generatedAt: nextDraft.generatedAt,
          }
        : {
            anomalyId: card.anomaly.id,
            action,
          };

    const response = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const payloadJson = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payloadJson?.error ?? "message_update_failed");
    }
  }

  async function openDraftWithTone(tone: MessageTone) {
    const nextDraft = generateCustomerMessageDraft({
      anomaly: card.anomaly,
      employee: card.employee,
      tone,
      draftId: createId("message"),
      generatedAt: new Date().toISOString(),
    });

    setDraft(nextDraft);
    setIsMessageModalOpen(true);
    setErrorMessage(null);
    setIsGeneratingMessage(true);

    try {
      await persistCustomerMessage("generate_customer_message", nextDraft);
    } catch {
      setErrorMessage("Unable to save this draft right now.");
    } finally {
      setIsGeneratingMessage(false);
    }
  }

  async function handleCopy() {
    if (!draft) {
      return;
    }

    setCopyConfirmation(null);
    try {
      await writeTextToClipboard([draft.subject, "", draft.body].filter(Boolean).join("\n"));
      setCopyConfirmation("Kopioitu leikepöydälle.");
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopyConfirmation(null);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setErrorMessage("Unable to copy this message right now.");
    }
  }

  async function handleImproveTone() {
    if (!draft) {
      return;
    }

    const nextTone: MessageTone = draft.tone === "neutral" ? "polite_urgent" : "neutral";
    const nextDraft = generateCustomerMessageDraft({
      anomaly: card.anomaly,
      employee: card.employee,
      tone: nextTone,
      draftId: createId("message"),
      generatedAt: new Date().toISOString(),
    });

    setDraft(nextDraft);
    setErrorMessage(null);
    setIsGeneratingMessage(true);

    try {
      await persistCustomerMessage("generate_customer_message", nextDraft);
    } catch {
      setErrorMessage("Unable to save this draft right now.");
    } finally {
      setIsGeneratingMessage(false);
    }
  }

  async function handleMarkAsSent() {
    if (!draft) {
      return;
    }

    setIsSendingMessage(true);
    setErrorMessage(null);

    try {
      await persistCustomerMessage("mark_customer_message_sent");
      setIsMessageModalOpen(false);
      setDraft(null);
      router.refresh();
    } catch {
      setErrorMessage("Unable to mark this message as sent right now.");
    } finally {
      setIsSendingMessage(false);
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
          {isSavingReview && !reviewDisabled ? "Saving..." : actionLabel("mark_as_reviewed")}
        </button>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          disabled={askCustomerDisabled}
          type="button"
          onClick={() => submit("ask_customer")}
        >
          {isSavingReview && !askCustomerDisabled ? "Saving..." : actionLabel("ask_customer")}
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
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          disabled={!canOpenMessageDraft}
          title={canOpenMessageDraft ? "Draft a Finnish customer message" : "This anomaly cannot use customer messages"}
          type="button"
          onClick={() => openDraftWithTone(draftTone)}
        >
          {isGeneratingMessage && isMessageModalOpen ? "Generating..." : "Generate customer message"}
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
      <MessageDraftModal
        open={isMessageModalOpen}
        draft={draft}
        generatedAtLabel={draft ? new Intl.DateTimeFormat("fi-FI", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(draft.generatedAt)) : ""}
        copyConfirmation={copyConfirmation}
        isCopying={false}
        isSending={isSendingMessage}
        improveToneLabel={improveToneLabel}
        canCopy={Boolean(draft)}
        canSend={Boolean(draft)}
        onClose={() => {
          setIsMessageModalOpen(false);
          setErrorMessage(null);
        }}
        onCopy={handleCopy}
        onImproveTone={handleImproveTone}
        onMarkAsSent={handleMarkAsSent}
      />
    </div>
  );
}
