import type { AnomalyStatus } from "@/lib/domain/types";
import type { AuditEvent, IgnoreReasonCode } from "@/lib/audit/types";

export type DemoReviewAnomalyState = {
  status: AnomalyStatus;
  reviewedAt?: string;
  ignoredReason?: IgnoreReasonCode;
  messageDraftId?: string;
  customerMessageSentAt?: string;
};

export type DemoReviewState = {
  anomalyStates: Record<string, DemoReviewAnomalyState>;
  auditEvents: AuditEvent[];
};

export type ReviewMutationAction = "mark_as_reviewed" | "ask_customer" | "open_detail" | "ignore_with_reason";

export type ReviewMutationRequest = {
  anomalyId: string;
  action: ReviewMutationAction;
  reasonCode?: IgnoreReasonCode;
  note?: string;
};

export type ReviewMutationErrorCode =
  | "unauthenticated"
  | "invalid_origin"
  | "invalid_anomaly_id"
  | "invalid_action"
  | "invalid_reason_code"
  | "forbidden_transition";

export type ReviewMutationSession = {
  reviewerLabel: string;
  sessionId: string;
};
