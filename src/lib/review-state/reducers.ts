import { createId } from "@/lib/utils/id";
import { appendAuditEvent } from "@/lib/audit/append-event";
import type { PayrollAnomaly } from "@/lib/domain/types";
import type { IgnoreReasonCode } from "@/lib/audit/types";
import type {
  AuditEvent,
  DemoReviewAnomalyState,
  DemoReviewState,
  ReviewMutationAction,
} from "./types";

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
  messageDraftId?: string | null;
  messageTone?: DemoReviewAnomalyState["messageTone"] | null;
  customerMessageGeneratedAt?: string | null;
  customerMessageSentAt?: string | null;
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
  } else if (input.messageDraftId === null) {
    delete nextState.messageDraftId;
  }

  if (input.messageTone) {
    nextState.messageTone = input.messageTone;
  } else if (input.messageTone === null) {
    delete nextState.messageTone;
  }

  if (input.customerMessageGeneratedAt) {
    nextState.customerMessageGeneratedAt = input.customerMessageGeneratedAt;
  } else if (input.customerMessageGeneratedAt === null) {
    delete nextState.customerMessageGeneratedAt;
  }

  if (input.customerMessageSentAt) {
    nextState.customerMessageSentAt = input.customerMessageSentAt;
  } else if (input.customerMessageSentAt === null) {
    delete nextState.customerMessageSentAt;
  }

  return {
    anomalyStates: {
      ...reviewState.anomalyStates,
      [input.anomalyId]: nextState,
    },
    auditEvents: appendAuditEvent(reviewState.auditEvents, input.auditEvent),
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
        : action === "ask_customer"
          ? "anomaly_waiting_for_customer"
          : action === "generate_customer_message"
            ? "customer_message_generated"
            : "customer_message_sent",
    targetId: anomalyId,
    detail,
  };
}
