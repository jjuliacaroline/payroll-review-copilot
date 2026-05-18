import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import IgnoreReasonDialog from "./ignore-reason-dialog";

describe("IgnoreReasonDialog", () => {
  it("renders reason choices and note input", () => {
    const html = renderToStaticMarkup(
      <IgnoreReasonDialog
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
        errorMessage={null}
        isSaving={false}
        open
        onClose={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(html).toContain("Ignore with reason");
    expect(html).toContain("False positive");
    expect(html).toContain("Optional note for the audit trail");
    expect(html).toContain("Ignore anomaly");
  });
});
