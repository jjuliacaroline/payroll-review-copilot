import type { DemoPayrollRun } from "@/lib/demo-data";
import type { EmployeeRecord, PayrollAnomaly } from "./types";

export function selectTotalEmployees(employees: EmployeeRecord[]) {
  return employees.length;
}

export function selectDetectedAnomalyCount(anomalies: PayrollAnomaly[]) {
  return anomalies.length;
}

export function selectCriticalIssueCount(anomalies: PayrollAnomaly[]) {
  return anomalies.filter((anomaly) => anomaly.severity === "critical").length;
}

export function selectWaitingForCustomerCount(anomalies: PayrollAnomaly[]) {
  return anomalies.filter((anomaly) => anomaly.status === "waiting_for_customer").length;
}

export function selectEstimatedTimeSavedMinutes(payrollRun: DemoPayrollRun) {
  return payrollRun.estimatedTimeSavedMinutes;
}

export function selectPayrollRunSummary(
  payrollRun: DemoPayrollRun,
  employees: EmployeeRecord[],
  anomalies: PayrollAnomaly[],
) {
  return {
    companyName: payrollRun.companyName,
    payrollPeriodLabel: payrollRun.payrollPeriodLabel,
    paymentDate: payrollRun.paymentDate,
    employeeCount: selectTotalEmployees(employees),
    status: payrollRun.status,
    detectedAnomalies: selectDetectedAnomalyCount(anomalies),
    criticalIssues: selectCriticalIssueCount(anomalies),
    waitingForCustomerInput: selectWaitingForCustomerCount(anomalies),
    estimatedTimeSavedMinutes: selectEstimatedTimeSavedMinutes(payrollRun),
  };
}

