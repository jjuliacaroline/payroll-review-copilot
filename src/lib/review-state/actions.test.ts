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

  it("updates an anomaly to ignored with a reason", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_tax_card",
        action: "ignore_with_reason",
        reason: "false_positive",
        note: "Duplicate payroll correction already applied.",
      },
      now: new Date("2026-05-18T08:13:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_tax_card?.status).toBe("ignored");
    expect(nextState.anomalyStates.anom_missing_tax_card?.ignoredReason).toBe("false_positive");
    expect(nextState.auditEvents[0]?.action).toBe("anomaly_ignored");
  });

  it("records a generated customer message draft", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: createInitialDemoReviewState(),
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_working_hours",
        action: "generate_customer_message",
        draftId: "message_123",
        tone: "neutral",
        generatedAt: "2026-05-18T08:15:00.000Z",
      },
      now: new Date("2026-05-18T08:15:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_working_hours).toEqual({
      status: "message_drafted",
      messageDraftId: "message_123",
      messageTone: "neutral",
      customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
    });
    expect(nextState.auditEvents[0]?.action).toBe("customer_message_generated");
  });

  it("records a tone regeneration for an existing customer message draft", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: {
        anomalyStates: {
          anom_missing_working_hours: {
            status: "message_drafted",
            messageDraftId: "message_123",
            messageTone: "neutral",
            customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
          },
        },
        auditEvents: [],
      },
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_working_hours",
        action: "generate_customer_message",
        draftId: "message_456",
        tone: "polite_urgent",
        generatedAt: "2026-05-18T08:20:00.000Z",
      },
      now: new Date("2026-05-18T08:20:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_working_hours).toEqual({
      status: "message_drafted",
      messageDraftId: "message_456",
      messageTone: "polite_urgent",
      customerMessageGeneratedAt: "2026-05-18T08:20:00.000Z",
    });
    expect(nextState.auditEvents[0]?.action).toBe("customer_message_tone_regenerated");
  });

  it("records a sent customer message and moves the anomaly back to waiting_for_customer", () => {
    const nextState = applyReviewMutation({
      session,
      currentState: {
        anomalyStates: {
          anom_missing_working_hours: {
            status: "message_drafted",
            messageDraftId: "message_123",
            messageTone: "neutral",
            customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
          },
        },
        auditEvents: [],
      },
      anomalies: demoAnomalies,
      request: {
        anomalyId: "anom_missing_working_hours",
        action: "mark_customer_message_sent",
      },
      now: new Date("2026-05-18T08:25:00.000Z"),
    });

    expect(nextState.anomalyStates.anom_missing_working_hours).toEqual({
      status: "waiting_for_customer",
      messageDraftId: "message_123",
      messageTone: "neutral",
      customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
      customerMessageSentAt: "2026-05-18T08:25:00.000Z",
    });
    expect(nextState.auditEvents[0]?.action).toBe("customer_message_sent");
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

  it("rejects unsupported customer message anomalies", () => {
    expect(() =>
      applyReviewMutation({
        session,
        currentState: createInitialDemoReviewState(),
        anomalies: demoAnomalies,
        request: {
          anomalyId: "anom_tulorekisteri_validation",
          action: "generate_customer_message",
          draftId: "message_789",
          tone: "neutral",
        },
      }),
    ).toThrowError("cannot use customer message drafting");
  });
});
