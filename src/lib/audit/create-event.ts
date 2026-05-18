import { createId } from "@/lib/utils/id";
import type { PayrollAnomaly } from "@/lib/domain/types";
import { getIgnoreReasonLabel } from "./labels";
import type { AuditEvent, AuditEventActor, IgnoreReasonCode } from "./types";

const MAX_AUDIT_NOTE_LENGTH = 240;

function sanitizeNote(note?: string) {
  const trimmed = note?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, MAX_AUDIT_NOTE_LENGTH);
}

function createAuditEvent(input: {
  action: AuditEvent["action"];
  targetId: string;
  detail: string;
  at: string;
  actor?: AuditEventActor;
  meta?: AuditEvent["meta"];
}): AuditEvent {
  return {
    id: createId("audit"),
    at: input.at,
    actor: input.actor ?? "reviewer",
    action: input.action,
    targetId: input.targetId,
    detail: input.detail,
    meta: input.meta,
  };
}

export function createAnomalyOpenedEvent(input: {
  anomaly: PayrollAnomaly;
  reviewerLabel: string;
  at: string;
}) {
  return createAuditEvent({
    action: "anomaly_opened",
    targetId: input.anomaly.id,
    at: input.at,
    detail: `${input.reviewerLabel} opened the detail view for ${input.anomaly.title}.`,
  });
}

export function createAnomalyReviewedEvent(input: {
  anomaly: PayrollAnomaly;
  reviewerLabel: string;
  at: string;
}) {
  return createAuditEvent({
    action: "anomaly_marked_reviewed",
    targetId: input.anomaly.id,
    at: input.at,
    detail: `${input.reviewerLabel} marked ${input.anomaly.title} as reviewed.`,
  });
}

export function createAnomalyWaitingForCustomerEvent(input: {
  anomaly: PayrollAnomaly;
  reviewerLabel: string;
  at: string;
}) {
  return createAuditEvent({
    action: "anomaly_waiting_for_customer",
    targetId: input.anomaly.id,
    at: input.at,
    detail: `${input.reviewerLabel} sent ${input.anomaly.title} back to the customer for confirmation.`,
  });
}

export function createAnomalyIgnoredEvent(input: {
  anomaly: PayrollAnomaly;
  reviewerLabel: string;
  reasonCode: IgnoreReasonCode;
  note?: string;
  at: string;
}) {
  const note = sanitizeNote(input.note);
  const reasonLabel = getIgnoreReasonLabel(input.reasonCode);
  const detail = note
    ? `${input.reviewerLabel} ignored ${input.anomaly.title} as ${reasonLabel}. Note: ${note}`
    : `${input.reviewerLabel} ignored ${input.anomaly.title} as ${reasonLabel}.`;

  return createAuditEvent({
    action: "anomaly_ignored",
    targetId: input.anomaly.id,
    at: input.at,
    detail,
    meta: {
      reasonCode: input.reasonCode,
      note,
    },
  });
}

export function sanitizeAuditNoteForStorage(note?: string) {
  return sanitizeNote(note);
}
