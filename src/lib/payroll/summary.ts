import { demoAnomalies, demoEmployees, demoPayrollRun } from "@/lib/demo-data";
import { selectPayrollRunSummary } from "@/lib/domain/selectors";

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

export const payrollRunSummary: PayrollRunSummary = selectPayrollRunSummary(
  demoPayrollRun,
  demoEmployees,
  demoAnomalies,
);
