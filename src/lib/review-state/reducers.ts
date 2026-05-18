import { createId } from "@/lib/utils/id";
import type { PayrollAnomaly } from "@/lib/domain/types";
import type {
  DemoReviewAnomalyState,
  DemoReviewState,
  ReviewMutationAction,
} from "./types";
import type { IgnoreReasonCode } from "@/lib/audit/types";
import type { AuditEvent } from "@/lib/audit/types";

export function createInitialDemoReviewState(): DemoReviewState {
  return {
    anomalyStates: {},
    auditEvents: [],
  };
}

export function getEffectiveAnomalyState(
  anomaly: PayrollAnomaly,
  reviewState: DemoReviewState,
): DemoReviewAnomalyState {
  return reviewState.anomalyStates[anomaly.id] ?? { status: anomaly.status };
}

export function getEffectiveAnomalyStatus(
  anomaly: PayrollAnomaly,
  reviewState: DemoReviewState,
) {
  return getEffectiveAnomalyState(anomaly, reviewState).status;
}

type ReduceDemoReviewStateInput = {
  anomalyId: string;
  nextStatus: DemoReviewAnomalyState["status"];
  at: string;
  auditEvent: AuditEvent;
  ignoredReason?: IgnoreReasonCode;
  messageDraftId?: string;
  customerMessageSentAt?: string;
};

export function reduceDemoReviewState(
  reviewState: DemoReviewState,
  input: ReduceDemoReviewStateInput,
): DemoReviewState {
  const nextState: DemoReviewAnomalyState = {
    status: input.nextStatus,
  };

  if (input.nextStatus === "reviewed") {
    nextState.reviewedAt = input.at;
  }

  if (input.nextStatus === "ignored" && input.ignoredReason) {
    nextState.ignoredReason = input.ignoredReason;
  }

  if (input.messageDraftId) {
    nextState.messageDraftId = input.messageDraftId;
  }

  if (input.customerMessageSentAt) {
    nextState.customerMessageSentAt = input.customerMessageSentAt;
  }

  return {
    anomalyStates: {
      ...reviewState.anomalyStates,
      [input.anomalyId]: nextState,
    },
    auditEvents: [...reviewState.auditEvents, input.auditEvent].slice(-50),
  };
}

export function createReviewAuditEvent(
  action: ReviewMutationAction,
  anomalyId: string,
  detail: string,
  at: string,
): AuditEvent {
  return {
    id: createId("audit"),
    at,
    actor: "reviewer",
    action:
      action === "mark_as_reviewed"
        ? "anomaly_marked_reviewed"
        : "anomaly_waiting_for_customer",
    targetId: anomalyId,
    detail,
  };
}
