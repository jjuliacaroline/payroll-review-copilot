export type PayrollRunStatus = "review_in_progress" | "ready_for_approval";

export type PayrollRunSummary = {
  companyName: string;
  payrollPeriodLabel: string;
  paymentDate: string;
  employeeCount: number;
  status: PayrollRunStatus;
  detectedAnomalies: number;
  criticalIssues: number;
  waitingForCustomerInput: number;
  estimatedTimeSavedMinutes: number;
};

export const payrollRunSummary: PayrollRunSummary = {
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
