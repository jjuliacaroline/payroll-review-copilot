export type Severity = "critical" | "warning" | "info";

export type AnomalyStatus =
  | "open"
  | "reviewed"
  | "waiting_for_customer"
  | "ignored"
  | "message_drafted"
  | "message_sent";

export type EmployeeRecord = {
  id: string;
  fullName: string;
  roleTitle: string;
  employmentType: "monthly" | "hourly";
  team: string;
};

export type PayrollAnomaly = {
  id: string;
  employeeId: string;
  severity: Severity;
  type:
    | "missing_tax_card"
    | "net_salary_change"
    | "final_salary_checklist_incomplete"
    | "missing_working_hours"
    | "tulorekisteri_validation"
    | "missing_lunch_benefit"
    | "absence_affects_salary";
  title: string;
  explanation: string;
  evidence: string;
  suggestedNextAction: string;
  status: AnomalyStatus;
  previousMonthContext?: string;
  blockingApproval: boolean;
};

export type AuditEventSeed = {
  id: string;
  at: string;
  actor: "system_ai";
  action: string;
  targetId?: string;
  detail: string;
};

export type ChecklistItemKey =
  | "employee_data_checked"
  | "tax_card_data_checked"
  | "absences_checked"
  | "benefits_checked"
  | "final_salary_cases_checked"
  | "customer_missing_info_resolved"
  | "tulorekisteri_validation_checked"
  | "ready_for_approval";

