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
    });
  });

  it("stores customer message draft metadata", () => {
    const nextState = reduceDemoReviewState(createInitialDemoReviewState(), {
      anomalyId: "anom_missing_working_hours",
      nextStatus: "message_drafted",
      at: "2026-05-18T08:15:00.000Z",
      auditEvent: {
        id: createId("audit"),
        at: "2026-05-18T08:15:00.000Z",
        actor: "reviewer",
        action: "customer_message_generated",
        targetId: "anom_missing_working_hours",
        detail: "Generated a message draft.",
      },
      messageDraftId: "message_123",
      messageTone: "neutral",
      customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
    });

    expect(nextState.anomalyStates.anom_missing_working_hours).toEqual({
      status: "message_drafted",
      messageDraftId: "message_123",
      messageTone: "neutral",
      customerMessageGeneratedAt: "2026-05-18T08:15:00.000Z",
    });
  });

  it("caps audit events to the most recent 50 entries", () => {
    const initialState = {
      anomalyStates: {},
      auditEvents: Array.from({ length: 50 }, (_, index) => ({
        id: `audit_${index}`,
        at: `2026-05-18T08:${String(index).padStart(2, "0")}:00.000Z`,
        actor: "reviewer" as const,
        action: "anomaly_marked_reviewed" as const,
        targetId: "anom_missing_tax_card",
        detail: `Event ${index}`,
      })),
    };

    const nextState = reduceDemoReviewState(initialState, {
      anomalyId: "anom_missing_tax_card",
      nextStatus: "reviewed",
      at: "2026-05-18T09:00:00.000Z",
      auditEvent: {
        id: createId("audit"),
        at: "2026-05-18T09:00:00.000Z",
        actor: "reviewer",
        action: "anomaly_marked_reviewed",
        targetId: "anom_missing_tax_card",
        detail: "Marked as reviewed.",
      },
    });

    expect(nextState.auditEvents).toHaveLength(50);
    expect(nextState.auditEvents[0]?.id).toBe("audit_1");
    expect(nextState.auditEvents[49]?.detail).toBe("Marked as reviewed.");
  });
});
