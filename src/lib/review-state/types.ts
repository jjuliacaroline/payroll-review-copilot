import type { AnomalyStatus } from "@/lib/domain/types";

export type AuditEvent = {
  id: string;
  at: string;
  actor: "reviewer" | "system_ai";
  action:
    | "anomaly_marked_reviewed"
    | "anomaly_waiting_for_customer"
    | "anomaly_ignored"
    | "customer_message_generated"
    | "customer_message_sent";
  targetId: string;
  detail: string;
};

export type DemoReviewAnomalyState = {
  status: AnomalyStatus;
  reviewedAt?: string;
  ignoredReason?: string;
  messageDraftId?: string;
  customerMessageSentAt?: string;
};

export type DemoReviewState = {
  anomalyStates: Record<string, DemoReviewAnomalyState>;
  auditEvents: AuditEvent[];
};

export type ReviewMutationAction = "mark_as_reviewed" | "ask_customer";

export type ReviewMutationRequest = {
  anomalyId: string;
  action: ReviewMutationAction;
};

export type ReviewMutationErrorCode =
  | "unauthenticated"
  | "invalid_origin"
  | "invalid_anomaly_id"
  | "invalid_action"
  | "forbidden_transition";

export type ReviewMutationSession = {
  reviewerLabel: string;
  sessionId: string;
};

