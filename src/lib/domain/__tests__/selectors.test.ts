import { describe, expect, it } from "vitest";
import {
  selectCriticalIssueCount,
  selectEstimatedTimeSavedMinutes,
  selectPayrollRunSummary,
  selectTotalEmployees,
  selectWaitingForCustomerCount,
} from "../selectors";
import { demoAnomalies, demoEmployees, demoPayrollRun } from "@/lib/demo-data";

describe("domain selectors", () => {
  it("computes the dashboard summary counts from the demo dataset", () => {
    expect(selectTotalEmployees(demoEmployees)).toBe(18);
    expect(selectCriticalIssueCount(demoAnomalies)).toBe(2);
    expect(selectWaitingForCustomerCount(demoAnomalies)).toBe(3);
    expect(selectEstimatedTimeSavedMinutes(demoPayrollRun)).toBe(420);
  });

  it("builds the payroll run summary from the demo dataset", () => {
    expect(selectPayrollRunSummary(demoPayrollRun, demoEmployees, demoAnomalies)).toEqual({
      companyName: "Demo Company Oy",
      payrollPeriodLabel: "May 2026",
      paymentDate: "2026-05-31",
      employeeCount: 18,
      status: "review_in_progress",
      detectedAnomalies: 7,
      criticalIssues: 2,
      waitingForCustomerInput: 3,
      estimatedTimeSavedMinutes: 420,
    });
  });
});

