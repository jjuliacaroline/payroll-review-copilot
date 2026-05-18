export type DemoPayrollRun = {
  id: string;
  companyName: string;
  payrollPeriodLabel: string;
  paymentDate: string;
  status: "review_in_progress" | "ready_for_approval";
  estimatedTimeSavedMinutes: number;
  customerContext: string;
  accountingContext: string;
};

export const demoPayrollRun: DemoPayrollRun = {
  id: "run_may_2026_demo",
  companyName: "Demo Company Oy",
  payrollPeriodLabel: "May 2026",
  paymentDate: "2026-05-31",
  status: "review_in_progress",
  estimatedTimeSavedMinutes: 420,
  customerContext:
    "Demo customer contact requested a careful review of overtime, benefits, and missing source data before approval.",
  accountingContext:
    "Demo accounting partner flagged a small batch of validation notes from the imported payroll run.",
};

