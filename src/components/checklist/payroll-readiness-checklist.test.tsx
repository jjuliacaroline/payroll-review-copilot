import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PayrollReadinessChecklist from "./payroll-readiness-checklist";

describe("PayrollReadinessChecklist", () => {
  it("renders checklist rows and statuses", () => {
    const html = renderToStaticMarkup(
      <PayrollReadinessChecklist
        items={[
          {
            key: "employee_data_checked",
            label: "Employee data checked",
            status: "complete",
            detail: "All employees are synced.",
          },
          {
            key: "tax_card_data_checked",
            label: "Tax card data checked",
            status: "blocked",
            detail: "Missing tax card data needs customer confirmation.",
          },
        ]}
      />,
    );

    expect(html).toContain("Payroll readiness checklist");
    expect(html).toContain("Employee data checked");
    expect(html).toContain("Tax card data checked");
    expect(html).toContain("Complete");
    expect(html).toContain("Blocked");
  });
});
