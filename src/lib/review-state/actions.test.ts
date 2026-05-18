import { describe, expect, it } from "vitest";
import { demoAnomalies } from "@/lib/demo-data";
import { createInitialDemoReviewState } from "./reducers";
import { applyReviewMutation, ReviewMutationError } from "./actions";

const session = {
  reviewerLabel: "Demo Reviewer",
  sessionId: "session_123",
};

describe("review mutation actions", () => {
  it("updates an anomaly to reviewed", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_tax_card",
        action: "mark_as_reviewed",
      },
      now: new Date("2026-05-18T08:10:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_tax_card?.status).toBe("reviewed");
    expect(nextState.auditEvents).toHaveLength(1);
  });

  it("updates an anomaly to waiting_for_customer", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_tax_card",
        action: "ask_customer",
      },
      now: new Date("2026-05-18T08:12:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_tax_card?.status).toBe("waiting_for_customer");
    expect(nextState.auditEvents[0]?.action).toBe("anomaly_waiting_for_customer");
  });

  it("records opening a detail view without changing status", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_tax_card",
        action: "open_detail",
      },
      now: new Date("2026-05-18T08:13:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_tax_card).toBeUndefined();
    expect(nextState.auditEvents[0]?.action).toBe("anomaly_opened");
  });

  it("updates an anomaly to ignored with a reason", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_tax_card",
        action: "ignore_with_reason",
        reasonCode: "false_positive",
        note: "Already cleared in the customer system.",
      },
      now: new Date("2026-05-18T08:14:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_tax_card?.status).toBe("ignored");
    expect(nextState.anomalyStates.anom_missing_tax_card?.ignoredReason).toBe("false_positive");
    expect(nextState.auditEvents[0]?.action).toBe("anomaly_ignored");
    expect(nextState.auditEvents[0]?.meta?.reasonCode).toBe("false_positive");
  });

  it("rejects invalid anomaly ids", () => {
    expect(() =>
      applyReviewMutation({
        session,
        currentState: createInitialDemoReviewState(),
        anomalies: demoAnomalies,
        request: {
          anomalyId: "unknown_anomaly",
          action: "mark_as_reviewed",
        },
      }),
    ).toThrowError(ReviewMutationError);
  });

  it("rejects unauthenticated mutations", () => {
    expect(() =>
      applyReviewMutation({
        session: null,
        currentState: createInitialDemoReviewState(),
        anomalies: demoAnomalies,
        request: {
          anomalyId: "anom_missing_tax_card",
          action: "mark_as_reviewed",
        },
      }),
    ).toThrowError("Authentication is required.");
  });

  it("rejects same-state transitions", () => {
    expect(() =>
      applyReviewMutation({
        session,
        currentState: {
          anomalyStates: {
            anom_missing_tax_card: {
              status: "reviewed",
              reviewedAt: "2026-05-18T08:00:00.000Z",
            },
          },
          auditEvents: [],
        },
        anomalies: demoAnomalies,
        request: {
          anomalyId: "anom_missing_tax_card",
          action: "mark_as_reviewed",
        },
      }),
    ).toThrowError("already in that state");
  });

  it("rejects invalid ignore reason codes", () => {
    expect(() =>
      applyReviewMutation({
        session,
        currentState: createInitialDemoReviewState(),
        anomalies: demoAnomalies,
        request: {
          anomalyId: "anom_missing_tax_card",
          action: "ignore_with_reason",
          reasonCode: "unknown_reason" as never,
        },
      }),
    ).toThrowError("Ignore reason was not recognized.");
  });
});
