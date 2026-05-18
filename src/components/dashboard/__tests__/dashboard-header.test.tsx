import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardHeader from "../dashboard-header";
import type { PayrollRunSummary } from "@/lib/payroll/summary";

const summary: PayrollRunSummary = {
  companyName: "Demo Company Oy",
  payrollPeriodLabel: "May 2026",
  paymentDate: "2026-05-31",
  employeeCount: 18,
  status: "review_in_progress",
  detectedAnomalies: 7,
  criticalIssues: 2,
  waitingForCustomerInput: 3,
  estimatedTimeSavedMinutes: 420,
};

describe("DashboardHeader", () => {
  it("renders core payroll run metadata", () => {
    const html = renderToStaticMarkup(<DashboardHeader summary={summary} />);

    expect(html).toContain("Demo Company Oy");
    expect(html).toContain("May 2026");
    expect(html).toContain("Payment date 31.5.2026");
    expect(html).toContain("18 employees");
    expect(html).toContain("Review in progress");
  });
});
