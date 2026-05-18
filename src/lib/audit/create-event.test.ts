import { describe, expect, it } from "vitest";
import { createAnomalyIgnoredEvent, createAnomalyOpenedEvent, createAnomalyReviewedEvent } from "./create-event";

const anomaly = {
  id: "anom_missing_tax_card",
  employeeId: "emp_07",
  severity: "critical" as const,
  type: "missing_tax_card" as const,
  title: "Missing tax card data",
  explanation: "The employee is included in the May payroll draft.",
  evidence: "The May import returned an empty tax reference.",
  suggestedNextAction: "Request the updated tax card before approving the payroll run.",
  status: "open" as const,
  previousMonthContext: "April tax card values were present and matched the expected rate.",
  blockingApproval: true,
};

describe("audit event creators", () => {
  it("creates an anomaly opened event", () => {
    const event = createAnomalyOpenedEvent({
      anomaly,
      reviewerLabel: "Reviewer",
      at: "2026-05-18T08:00:00.000Z",
    });

    expect(event.action).toBe("anomaly_opened");
    expect(event.detail).toContain("opened the detail view");
  });

  it("creates an anomaly reviewed event", () => {
    const event = createAnomalyReviewedEvent({
      anomaly,
      reviewerLabel: "Reviewer",
      at: "2026-05-18T08:01:00.000Z",
    });

    expect(event.action).toBe("anomaly_marked_reviewed");
    expect(event.detail).toContain("marked Missing tax card data as reviewed");
  });

  it("creates an anomaly ignored event with reason metadata", () => {
    const event = createAnomalyIgnoredEvent({
      anomaly,
      reviewerLabel: "Reviewer",
      reasonCode: "false_positive",
      note: " Already resolved elsewhere. ",
      at: "2026-05-18T08:02:00.000Z",
    });

    expect(event.action).toBe("anomaly_ignored");
    expect(event.detail).toContain("False positive");
    expect(event.meta?.reasonCode).toBe("false_positive");
    expect(event.meta?.note).toBe("Already resolved elsewhere.");
  });
});
