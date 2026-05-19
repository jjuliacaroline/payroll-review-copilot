import type { PayrollAnomaly } from "@/lib/domain/types";
import { reduceDemoReviewState, createReviewAuditEvent, getEffectiveAnomalyStatus } from "./reducers";
import type {
  DemoReviewState,
  ReviewMutationAction,
  ReviewMutationErrorCode,
  ReviewMutationRequest,
  ReviewMutationSession,
} from "./types";

export class ReviewMutationError extends Error {
  code: ReviewMutationErrorCode;

  constructor(code: ReviewMutationErrorCode, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "ReviewMutationError";
    this.code = code;
  }
}

function nextStatusForAction(action: ReviewMutationAction) {
  if (action === "mark_as_reviewed") {
    return "reviewed";
  }

  if (action === "generate_customer_message") {
    return "message_drafted";
  }

  return "waiting_for_customer";
}

function auditDetailForMutation(
  session: ReviewMutationSession,
  anomaly: PayrollAnomaly,
  action: ReviewMutationAction,
  tone?: "neutral" | "polite_urgent",
) {
  if (action === "mark_as_reviewed") {
    return `${session.reviewerLabel} marked ${anomaly.title} as reviewed.`;
  }

  if (action === "ask_customer") {
    return `${session.reviewerLabel} sent ${anomaly.title} back to the customer for confirmation.`;
  }

  if (action === "generate_customer_message") {
    const toneLabel = tone === "polite_urgent" ? "polite urgent" : "neutral";
    return `${session.reviewerLabel} generated a ${toneLabel} customer message for ${anomaly.title}.`;
  }

  return `${session.reviewerLabel} marked the customer message for ${anomaly.title} as sent.`;
}

export function applyReviewMutation(input: {
  session: ReviewMutationSession | null;
  currentState: DemoReviewState;
  anomalies: PayrollAnomaly[];
  request: ReviewMutationRequest;
  now?: Date;
}): DemoReviewState {
  const { session, currentState, anomalies, request } = input;
  if (!session) {
    throw new ReviewMutationError("unauthenticated", "Authentication is required.");
  }

  const anomaly = anomalies.find((candidate) => candidate.id === request.anomalyId);
  if (!anomaly) {
    throw new ReviewMutationError("invalid_anomaly_id", "Anomaly id was not recognized.");
  }

  if (
    (request.action === "generate_customer_message" || request.action === "mark_customer_message_sent") &&
    anomaly.type === "tulorekisteri_validation"
  ) {
    throw new ReviewMutationError("invalid_action", "This anomaly cannot use customer message drafting.");
  }

  const nextStatus = nextStatusForAction(request.action);
  const effectiveStatus = getEffectiveAnomalyStatus(anomaly, currentState);
  if (effectiveStatus === nextStatus && request.action !== "generate_customer_message") {
    throw new ReviewMutationError("forbidden_transition", "The anomaly is already in that state.");
  }

  const at = (input.now ?? new Date()).toISOString();
  const auditAction =
    request.action === "generate_customer_message" &&
    (currentState.anomalyStates[anomaly.id]?.messageDraftId || currentState.anomalyStates[anomaly.id]?.messageTone)
      ? "customer_message_tone_regenerated"
      : request.action === "generate_customer_message"
        ? "customer_message_generated"
        : request.action === "mark_customer_message_sent"
          ? "customer_message_sent"
          : request.action === "mark_as_reviewed"
            ? "anomaly_marked_reviewed"
            : "anomaly_waiting_for_customer";

  const auditEvent = {
    id: createReviewAuditEvent(request.action, anomaly.id, "", at).id,
    at,
    actor: "reviewer" as const,
    action: auditAction,
    targetId: anomaly.id,
    detail: auditDetailForMutation(session, anomaly, request.action, request.tone),
  };

  if (request.action === "generate_customer_message") {
    return reduceDemoReviewState(currentState, {
      anomalyId: anomaly.id,
      nextStatus,
      at,
      auditEvent,
      messageDraftId: request.draftId ?? null,
      messageTone: request.tone ?? null,
      customerMessageGeneratedAt: request.generatedAt ?? at,
      customerMessageSentAt: null,
    });
  }

  if (request.action === "mark_customer_message_sent") {
    const existingMessageState = currentState.anomalyStates[anomaly.id];
    return reduceDemoReviewState(currentState, {
      anomalyId: anomaly.id,
      nextStatus,
      at,
      auditEvent,
      messageDraftId: existingMessageState?.messageDraftId ?? null,
      messageTone: existingMessageState?.messageTone ?? null,
      customerMessageGeneratedAt: existingMessageState?.customerMessageGeneratedAt ?? null,
      customerMessageSentAt: at,
    });
  }

  return reduceDemoReviewState(currentState, {
    anomalyId: anomaly.id,
    nextStatus,
    at,
    auditEvent,
  });
}
