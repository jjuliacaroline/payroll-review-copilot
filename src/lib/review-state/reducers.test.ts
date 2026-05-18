import { describe, expect, it } from "vitest";
import { createInitialDemoReviewState, reduceDemoReviewState } from "./reducers";
import { createId } from "@/lib/utils/id";

describe("review state reducers", () => {
  it("starts with an empty session state", () => {
    expect(createInitialDemoReviewState()).toEqual({
      anomalyStates: {},
      auditEvents: [],
    });
  });

  it("stores a reviewed anomaly state and audit event", () => {
    const nextState = reduceDemoReviewState(createInitialDemoReviewState(), {
      anomalyId: "anom_missing_tax_card",
      nextStatus: "reviewed",
      at: "2026-05-18T08:00:00.000Z",
      auditEvent: {
        id: createId("audit"),
        at: "2026-05-18T08:00:00.000Z",
        actor: "reviewer",
        action: "anomaly_marked_reviewed",
        targetId: "anom_missing_tax_card",
        detail: "Marked as reviewed.",
      },
    });

    expect(nextState.anomalyStates.anom_missing_tax_card).toEqual({
      status: "reviewed",
      reviewedAt: "2026-05-18T08:00:00.000Z",
    });
    expect(nextState.auditEvents).toHaveLength(1);
  });

  it("stores a waiting-for-customer anomaly state", () => {
    const nextState = reduceDemoReviewState(createInitialDemoReviewState(), {
      anomalyId: "anom_missing_working_hours",
      nextStatus: "waiting_for_customer",
      at: "2026-05-18T08:05:00.000Z",
      auditEvent: {
        id: createId("audit"),
        at: "2026-05-18T08:05:00.000Z",
        actor: "reviewer",
        action: "anomaly_waiting_for_customer",
        targetId: "anom_missing_working_hours",
        detail: "Asked the customer for missing hours.",
      },
    });

    expect(nextState.anomalyStates.anom_missing_working_hours).toEqual({
      status: "waiting_for_customer",
      reviewedAt: "2026-05-18T08:05:00.000Z",
    });
  });
});

