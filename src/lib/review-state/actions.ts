import type { PayrollAnomaly } from "@/lib/domain/types";
import { reduceDemoReviewState, getEffectiveAnomalyStatus } from "./reducers";
import type {
  DemoReviewState,
  ReviewMutationAction,
  ReviewMutationErrorCode,
  ReviewMutationRequest,
  ReviewMutationSession,
} from "./types";
import {
  createAnomalyIgnoredEvent,
  createAnomalyOpenedEvent,
  createAnomalyReviewedEvent,
  createAnomalyWaitingForCustomerEvent,
  sanitizeAuditNoteForStorage,
} from "@/lib/audit/create-event";
import type { IgnoreReasonCode } from "@/lib/audit/types";

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

  if (action === "ask_customer") {
    return "waiting_for_customer";
  }

  if (action === "ignore_with_reason") {
    return "ignored";
  }

  return "open";
}

function isIgnoreReasonCode(value: unknown): value is IgnoreReasonCode {
  return (
    value === "false_positive" ||
    value === "already_resolved_outside_system" ||
    value === "customer_confirmed_exception" ||
    value === "not_relevant_for_this_run"
  );
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

  if (request.action === "ignore_with_reason" && !isIgnoreReasonCode(request.reasonCode)) {
    throw new ReviewMutationError("invalid_reason_code", "Ignore reason was not recognized.");
  }

  const at = (input.now ?? new Date()).toISOString();

  if (request.action === "open_detail") {
    const auditEvent = createAnomalyOpenedEvent({
      anomaly,
      reviewerLabel: session.reviewerLabel,
      at,
    });

    return {
      ...currentState,
      auditEvents: [...currentState.auditEvents, auditEvent].slice(-50),
    };
  }

  const nextStatus = nextStatusForAction(request.action);
  const effectiveStatus = getEffectiveAnomalyStatus(anomaly, currentState);
  if (effectiveStatus === nextStatus) {
    throw new ReviewMutationError("forbidden_transition", "The anomaly is already in that state.");
  }

  const auditEvent =
    request.action === "mark_as_reviewed"
      ? createAnomalyReviewedEvent({
          anomaly,
          reviewerLabel: session.reviewerLabel,
          at,
        })
      : request.action === "ask_customer"
        ? createAnomalyWaitingForCustomerEvent({
            anomaly,
            reviewerLabel: session.reviewerLabel,
            at,
          })
        : createAnomalyIgnoredEvent({
            anomaly,
            reviewerLabel: session.reviewerLabel,
            reasonCode: request.reasonCode as IgnoreReasonCode,
            note: sanitizeAuditNoteForStorage(request.note),
            at,
          });

  return reduceDemoReviewState(currentState, {
    anomalyId: anomaly.id,
    nextStatus,
    at,
    auditEvent,
    ignoredReason: request.action === "ignore_with_reason" ? request.reasonCode : undefined,
  });
}
