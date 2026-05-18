import { demoEmployees } from "./employees";
import { demoPayrollRun } from "./payroll-run";
import { demoAnomalies } from "./anomalies";
import { demoChecklistSeed } from "./checklist";
import { demoAuditSeedEntries } from "./audit";

export { demoEmployees } from "./employees";
export { demoPayrollRun } from "./payroll-run";
export { demoAnomalies } from "./anomalies";
export { demoChecklistSeed } from "./checklist";
export { demoAuditSeedEntries } from "./audit";

export type { DemoPayrollRun } from "./payroll-run";
export type { DemoChecklistSeedItem } from "./checklist";

export const demoData = {
  payrollRun: demoPayrollRun,
  employees: demoEmployees,
  anomalies: demoAnomalies,
  checklistSeed: demoChecklistSeed,
  auditSeedEntries: demoAuditSeedEntries,
} as const;
