import type { AnomalyStatus } from "@/lib/domain/types";
import type { MessageTone } from "@/lib/messages/types";
import type { AuditEvent, IgnoreReasonCode } from "@/lib/audit/types";

export type DemoReviewAnomalyState = {
  status: AnomalyStatus;
  reviewedAt?: string;
  ignoredReason?: IgnoreReasonCode;
  messageDraftId?: string;
  messageTone?: MessageTone;
  customerMessageGeneratedAt?: string;
  customerMessageSentAt?: string;
};

export type DemoReviewState = {
  anomalyStates: Record<string, DemoReviewAnomalyState>;
  auditEvents: AuditEvent[];
};

export type ReviewMutationAction =
  | "mark_as_reviewed"
  | "ask_customer"
  | "generate_customer_message"
  | "mark_customer_message_sent"
  | "ignore_with_reason";

export type ReviewMutationRequest = {
  anomalyId: string;
  action: ReviewMutationAction;
  draftId?: string;
  tone?: MessageTone;
  generatedAt?: string;
  reason?: IgnoreReasonCode;
  note?: string;
};

export type ReviewMutationErrorCode =
  | "unauthenticated"
  | "invalid_origin"
  | "invalid_anomaly_id"
  | "invalid_action"
  | "invalid_ignore_reason"
  | "invalid_note"
  | "forbidden_transition";

export type ReviewMutationSession = {
  reviewerLabel: string;
  sessionId: string;
};
