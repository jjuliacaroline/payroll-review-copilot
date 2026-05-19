import type { AnomalyStatus, ChecklistItemKey, PayrollAnomaly } from "@/lib/domain/types";
import type { DemoReviewState } from "@/lib/review-state/types";
import { getEffectiveAnomalyStatus } from "@/lib/review-state/reducers";
import type { ChecklistItem } from "./types";

const resolvedStatuses = new Set<AnomalyStatus>(["reviewed", "ignored", "message_sent"]);
const customerPendingStatuses = new Set<AnomalyStatus>(["waiting_for_customer", "message_drafted"]);

const checklistLabels: Record<ChecklistItemKey, string> = {
  employee_data_checked: "Employee data checked",
  tax_card_data_checked: "Tax card data checked",
  absences_checked: "Absences checked",
  benefits_checked: "Benefits checked",
  final_salary_cases_checked: "Final salary cases checked",
  customer_missing_info_resolved: "Customer missing info resolved",
  tulorekisteri_validation_checked: "Tulorekisteri validation checked",
  ready_for_approval: "Ready for approval",
};

type EffectiveAnomaly = PayrollAnomaly & { effectiveStatus: AnomalyStatus };

function formatCount(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function toEffectiveAnomalies(anomalies: PayrollAnomaly[], reviewState: DemoReviewState) {
  return anomalies.map((anomaly) => ({
    ...anomaly,
    effectiveStatus: getEffectiveAnomalyStatus(anomaly, reviewState),
  }));
}

function unresolved(issues: EffectiveAnomaly[]) {
  return issues.filter((issue) => !resolvedStatuses.has(issue.effectiveStatus));
}

function byTypes(issues: EffectiveAnomaly[], types: PayrollAnomaly["type"][]) {
  return issues.filter((issue) => types.includes(issue.type));
}

export function deriveChecklistItems(input: {
  anomalies: PayrollAnomaly[];
  reviewState: DemoReviewState;
}): ChecklistItem[] {
  const effective = toEffectiveAnomalies(input.anomalies, input.reviewState);

  const employeeDataItem: ChecklistItem = {
    key: "employee_data_checked",
    label: checklistLabels.employee_data_checked,
    status: "complete",
    detail: "All employee profiles and payroll metadata are consistent for this run.",
  };

  const taxCardOpen = unresolved(byTypes(effective, ["missing_tax_card"]));
  const taxCardItem: ChecklistItem = {
    key: "tax_card_data_checked",
    label: checklistLabels.tax_card_data_checked,
    status: taxCardOpen.length > 0 ? "blocked" : "complete",
    detail:
      taxCardOpen.length > 0
        ? `Missing tax card data needs customer confirmation for ${formatCount(
            taxCardOpen.length,
            "employee",
            "employees",
          )}.`
        : "Tax card data matches the latest imports.",
  };

  const absenceOpen = unresolved(byTypes(effective, ["absence_affects_salary"]));
  const absenceItem: ChecklistItem = {
    key: "absences_checked",
    label: checklistLabels.absences_checked,
    status: absenceOpen.length > 0 ? "blocked" : "complete",
    detail:
      absenceOpen.length > 0
        ? `Unconfirmed absences affect salary calculations for ${formatCount(
            absenceOpen.length,
            "employee",
            "employees",
          )}.`
        : "Absence adjustments have been verified.",
  };

  const benefitOpen = unresolved(byTypes(effective, ["missing_lunch_benefit"]));
  const benefitItem: ChecklistItem = {
    key: "benefits_checked",
    label: checklistLabels.benefits_checked,
    status: benefitOpen.length > 0 ? "incomplete" : "complete",
    detail:
      benefitOpen.length > 0
        ? `A benefits update is still under review for ${formatCount(
            benefitOpen.length,
            "employee",
            "employees",
          )}.`
        : "Benefits feeds are aligned with payroll records.",
  };

  const finalSalaryOpen = unresolved(byTypes(effective, ["final_salary_checklist_incomplete"]));
  const finalSalaryItem: ChecklistItem = {
    key: "final_salary_cases_checked",
    label: checklistLabels.final_salary_cases_checked,
    status: finalSalaryOpen.length > 0 ? "incomplete" : "complete",
    detail:
      finalSalaryOpen.length > 0
        ? `Final salary checklist pending for ${formatCount(
            finalSalaryOpen.length,
            "employee",
            "employees",
          )}.`
        : "Final salary cases are confirmed.",
  };

  const customerPending = effective.filter((issue) =>
    customerPendingStatuses.has(issue.effectiveStatus),
  );
  const customerInfoItem: ChecklistItem = {
    key: "customer_missing_info_resolved",
    label: checklistLabels.customer_missing_info_resolved,
    status: customerPending.length > 0 ? "incomplete" : "complete",
    detail:
      customerPending.length > 0
        ? `Waiting on customer responses for ${formatCount(
            customerPending.length,
            "item",
            "items",
          )}.`
        : "All customer follow-ups are resolved.",
  };

  const tulorekisteriOpen = unresolved(byTypes(effective, ["tulorekisteri_validation"]));
  const tulorekisteriItem: ChecklistItem = {
    key: "tulorekisteri_validation_checked",
    label: checklistLabels.tulorekisteri_validation_checked,
    status: tulorekisteriOpen.length > 0 ? "blocked" : "complete",
    detail:
      tulorekisteriOpen.length > 0
        ? `Tulorekisteri validation still failing for ${formatCount(
            tulorekisteriOpen.length,
            "record",
            "records",
          )}.`
        : "Tulorekisteri validation passes for the run.",
  };

  const baseItems = [
    employeeDataItem,
    taxCardItem,
    absenceItem,
    benefitItem,
    finalSalaryItem,
    customerInfoItem,
    tulorekisteriItem,
  ];

  const blockedItems = baseItems.filter((item) => item.status === "blocked");
  const incompleteItems = baseItems.filter((item) => item.status === "incomplete");

  let readyStatus: ChecklistItem["status"] = "complete";
  let readyDetail = "All checklist items are complete. Payroll is ready for approval.";

  if (blockedItems.length > 0) {
    readyStatus = "incomplete";
    readyDetail = `Blocked by ${formatCount(
      blockedItems.length,
      "checklist item",
      "checklist items",
    )}. Resolve them before approval.`;
  } else if (incompleteItems.length > 0) {
    readyStatus = "incomplete";
    readyDetail = `Complete ${formatCount(
      incompleteItems.length,
      "remaining checklist item",
      "remaining checklist items",
    )} to approve.`;
  }

  const readyItem: ChecklistItem = {
    key: "ready_for_approval",
    label: checklistLabels.ready_for_approval,
    status: readyStatus,
    detail: readyDetail,
  };

  return [...baseItems, readyItem];
}
