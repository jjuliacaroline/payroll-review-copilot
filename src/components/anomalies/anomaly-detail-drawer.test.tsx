import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AnomalyDetailDrawer from "./anomaly-detail-drawer";

describe("AnomalyDetailDrawer", () => {
  it("renders the expanded anomaly context and history", () => {
    const html = renderToStaticMarkup(
      <AnomalyDetailDrawer
        card={{
          anomaly: {
            id: "anom_missing_tax_card",
            employeeId: "emp_07",
            severity: "critical",
            type: "missing_tax_card",
            title: "Missing tax card data",
            explanation: "The employee is included in the May payroll draft.",
            evidence: "The May import returned an empty tax reference.",
            suggestedNextAction: "Request the updated tax card before approving the payroll run.",
            status: "open",
            previousMonthContext: "April tax card values were present and matched the expected rate.",
            blockingApproval: true,
          },
          employee: {
            id: "emp_07",
            fullName: "Tiina Kallio",
            roleTitle: "Accounts Assistant",
            employmentType: "monthly",
            team: "Finance",
          },
          status: "open",
        }}
        events={[
          {
            id: "audit_1",
            at: "2026-05-18T08:00:00.000Z",
            actor: "reviewer",
            action: "anomaly_opened",
            targetId: "anom_missing_tax_card",
            detail: "Reviewer opened the detail view.",
          },
        ]}
        isSaving={false}
        open
        onClose={() => undefined}
        onIgnoreWithReason={() => undefined}
        onMarkReviewed={() => undefined}
      />,
    );

    expect(html).toContain("Missing tax card data");
    expect(html).toContain("Expanded explanation");
    expect(html).toContain("Action history");
    expect(html).toContain("Opened detail view");
    expect(html).toContain("Mark as reviewed");
  });
});
