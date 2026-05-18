import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardHeader from "../dashboard-header";
import { payrollRunSummary } from "@/lib/payroll/summary";

describe("DashboardHeader", () => {
  it("renders core payroll run metadata", () => {
    const html = renderToStaticMarkup(<DashboardHeader summary={payrollRunSummary} />);

    expect(html).toContain("Demo Company Oy");
    expect(html).toContain("May 2026");
    expect(html).toContain("Payment date 31.5.2026");
    expect(html).toContain("18 employees");
    expect(html).toContain("Review in progress");
  });
});
