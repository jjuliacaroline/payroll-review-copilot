import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AnomalyCard from "./anomaly-card";

vi.mock("./anomaly-actions", () => ({
  default: () => <div data-testid="anomaly-actions">Actions</div>,
}));

describe("AnomalyCard", () => {
  it("renders the core anomaly details and controls", () => {
    const html = renderToStaticMarkup(
      <AnomalyCard
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
      />,
    );

    expect(html).toContain("Missing tax card data");
    expect(html).toContain("Tiina Kallio");
    expect(html).toContain("Evidence");
    expect(html).toContain("Suggested next action");
    expect(html).toContain("Actions");
  });
});

