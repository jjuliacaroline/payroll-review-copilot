import type { DemoPayrollRun } from "@/lib/demo-data";
import type { EmployeeRecord, PayrollAnomaly, Severity } from "@/lib/domain/types";
import type { PayrollRunSummary } from "@/lib/payroll/summary";
import { getEffectiveAnomalyState, getEffectiveAnomalyStatus } from "./reducers";
import type { DemoReviewState } from "./types";

const severityRank: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const statusRank = {
  open: 0,
  waiting_for_customer: 1,
  reviewed: 2,
  ignored: 3,
  message_drafted: 4,
  message_sent: 5,
} as const;

export type AnomalyReviewCardViewModel = {
  anomaly: PayrollAnomaly;
  employee: EmployeeRecord;
  status: PayrollAnomaly["status"];
  reviewedAt?: string;
  ignoredReason?: string;
  messageDraftId?: string;
  customerMessageSentAt?: string;
};

type InternalAnomalyReviewCardViewModel = AnomalyReviewCardViewModel & {
  sortIndex: number;
};

function countEffectiveCriticalIssues(
  anomalies: PayrollAnomaly[],
  reviewState: DemoReviewState,
) {
  return anomalies.filter((anomaly) => {
    const status = getEffectiveAnomalyStatus(anomaly, reviewState);
    return anomaly.severity === "critical" && status !== "reviewed" && status !== "ignored" && status !== "message_sent";
  }).length;
}

function countWaitingForCustomer(
  anomalies: PayrollAnomaly[],
  reviewState: DemoReviewState,
) {
  return anomalies.filter((anomaly) => getEffectiveAnomalyStatus(anomaly, reviewState) === "waiting_for_customer").length;
}

export function selectLivePayrollRunSummary(
  baseSummary: PayrollRunSummary,
  anomalies: PayrollAnomaly[],
  reviewState: DemoReviewState,
): PayrollRunSummary {
  return {
    ...baseSummary,
    criticalIssues: countEffectiveCriticalIssues(anomalies, reviewState),
    waitingForCustomerInput: countWaitingForCustomer(anomalies, reviewState),
  };
}

export function selectAnomalyReviewCards(
  anomalies: PayrollAnomaly[],
  employees: EmployeeRecord[],
  reviewState: DemoReviewState,
): AnomalyReviewCardViewModel[] {
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));

  const cards: InternalAnomalyReviewCardViewModel[] = anomalies.flatMap((anomaly, index) => {
    const employee = employeeById.get(anomaly.employeeId);
    if (!employee) {
      return [];
    }

    const effectiveState = getEffectiveAnomalyState(anomaly, reviewState);
    return [
      {
        anomaly: {
          ...anomaly,
          status: effectiveState.status,
        },
        employee,
        status: effectiveState.status,
        reviewedAt: effectiveState.reviewedAt,
        ignoredReason: effectiveState.ignoredReason,
        messageDraftId: effectiveState.messageDraftId,
        customerMessageSentAt: effectiveState.customerMessageSentAt,
        sortIndex: index,
      },
    ];
  });

  return cards
    .sort((left, right) => {
      const severityDiff = severityRank[left.anomaly.severity] - severityRank[right.anomaly.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }

      const statusDiff = statusRank[left.status] - statusRank[right.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      return left.sortIndex - right.sortIndex;
    })
    .map(({ sortIndex: _sortIndex, ...card }) => card);
}
