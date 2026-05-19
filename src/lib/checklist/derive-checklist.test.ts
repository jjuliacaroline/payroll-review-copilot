import { describe, expect, it } from "vitest";
import { demoAnomalies } from "@/lib/demo-data";
import type { DemoReviewState } from "@/lib/review-state/types";
import { deriveChecklistItems } from "./derive-checklist";

function getItemStatus(items: ReturnType<typeof deriveChecklistItems>, key: string) {
  const item = items.find((entry) => entry.key === key);
  if (!item) {
    throw new Error(`Missing checklist item: ${key}`);
  }
  return item.status;
}

describe("deriveChecklistItems", () => {
  it("marks approval as incomplete when blockers remain", () => {
    const reviewState: DemoReviewState = {
      anomalyStates: {},
      auditEvents: [],
    };

    const items = deriveChecklistItems({
      anomalies: demoAnomalies,
      reviewState,
    });

    expect(getItemStatus(items, "tax_card_data_checked")).toBe("blocked");
    expect(getItemStatus(items, "ready_for_approval")).toBe("incomplete");
  });

  it("marks approval as complete once all anomalies are resolved", () => {
    const resolvedState: DemoReviewState = {
      anomalyStates: Object.fromEntries(
        demoAnomalies.map((anomaly) => [
          anomaly.id,
          {
            status: "reviewed",
            reviewedAt: "2026-05-19T10:00:00.000Z",
          },
        ]),
      ),
      auditEvents: [],
    };

    const items = deriveChecklistItems({
      anomalies: demoAnomalies,
      reviewState: resolvedState,
    });

    expect(getItemStatus(items, "customer_missing_info_resolved")).toBe("complete");
    expect(getItemStatus(items, "ready_for_approval")).toBe("complete");
  });
});
