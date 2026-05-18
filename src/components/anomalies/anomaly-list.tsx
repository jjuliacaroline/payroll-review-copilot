"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AnomalyCard from "./anomaly-card";
import AnomalyDetailDrawer from "./anomaly-detail-drawer";
import IgnoreReasonDialog from "./ignore-reason-dialog";
import type { AuditEvent, IgnoreReasonCode } from "@/lib/audit/types";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";

type AnomalyListProps = {
  cards: AnomalyReviewCardViewModel[];
  auditEvents: AuditEvent[];
};

export default function AnomalyList({ cards, auditEvents }: AnomalyListProps) {
  const router = useRouter();
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [ignoreTargetId, setIgnoreTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const selectedCard = useMemo(
    () => cards.find((card) => card.anomaly.id === selectedAnomalyId) ?? null,
    [cards, selectedAnomalyId],
  );

  const ignoreTargetCard = useMemo(
    () => cards.find((card) => card.anomaly.id === ignoreTargetId) ?? null,
    [cards, ignoreTargetId],
  );

  async function postReviewAction(request: {
    anomalyId: string;
    action: "open_detail" | "mark_as_reviewed" | "ignore_with_reason";
    reasonCode?: IgnoreReasonCode;
    note?: string;
  }) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
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

  function openDetails(anomalyId: string) {
    lastTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedAnomalyId(anomalyId);
    void postReviewAction({ anomalyId, action: "open_detail" });
  }

  function openIgnoreDialog(anomalyId: string) {
    setIgnoreTargetId(anomalyId);
  }

  function closeDrawer() {
    setSelectedAnomalyId(null);
    queueMicrotask(() => {
      lastTriggerRef.current?.focus();
    });
  }

  function closeIgnoreDialog() {
    setIgnoreTargetId(null);
  }

  async function submitIgnore(input: { reasonCode: IgnoreReasonCode; note?: string }) {
    if (!ignoreTargetCard) {
      return;
    }

    await postReviewAction({
      anomalyId: ignoreTargetCard.anomaly.id,
      action: "ignore_with_reason",
      reasonCode: input.reasonCode,
      note: input.note,
    });
    setIgnoreTargetId(null);
  }

  const historyEvents = selectedCard
    ? auditEvents.filter((event) => event.targetId === selectedCard.anomaly.id)
    : [];

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI anomaly review queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review the payroll issues flagged by the demo assistant.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">{cards.length} anomalies</p>
      </div>
      <div className="mt-6 grid gap-4">
        {cards.map((card) => (
          <AnomalyCard
            key={card.anomaly.id}
            card={card}
            onOpenDetails={openDetails}
            onOpenIgnore={openIgnoreDialog}
          />
        ))}
      </div>
      {selectedCard ? (
        <AnomalyDetailDrawer
          card={selectedCard}
          events={historyEvents}
          isSaving={isSaving}
          open
          onClose={closeDrawer}
          onIgnoreWithReason={() => openIgnoreDialog(selectedCard.anomaly.id)}
          onMarkReviewed={() =>
            void postReviewAction({
              anomalyId: selectedCard.anomaly.id,
              action: "mark_as_reviewed",
            })
          }
        />
      ) : null}
      <IgnoreReasonDialog
        card={ignoreTargetCard}
        errorMessage={errorMessage}
        isSaving={isSaving}
        open={ignoreTargetCard !== null}
        onClose={closeIgnoreDialog}
        onSubmit={(input) => void submitIgnore(input)}
      />
    </section>
  );
}
