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
  return action === "mark_as_reviewed" ? "reviewed" : "waiting_for_customer";
}

function auditDetailForMutation(
  session: ReviewMutationSession,
  anomaly: PayrollAnomaly,
  action: ReviewMutationAction,
) {
  if (action === "mark_as_reviewed") {
    return `${session.reviewerLabel} marked ${anomaly.title} as reviewed.`;
  }

  return `${session.reviewerLabel} sent ${anomaly.title} back to the customer for confirmation.`;
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

  const nextStatus = nextStatusForAction(request.action);
  const effectiveStatus = getEffectiveAnomalyStatus(anomaly, currentState);
  if (effectiveStatus === nextStatus) {
    throw new ReviewMutationError("forbidden_transition", "The anomaly is already in that state.");
  }

  const at = (input.now ?? new Date()).toISOString();
  const auditEvent = createReviewAuditEvent(
    request.action,
    anomaly.id,
    auditDetailForMutation(session, anomaly, request.action),
    at,
  );

  return reduceDemoReviewState(currentState, {
    anomalyId: anomaly.id,
    nextStatus,
    at,
    auditEvent,
  });
}
