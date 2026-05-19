import type { PayrollAnomaly } from "@/lib/domain/types";

export type MessageTone = "neutral" | "polite_urgent";

export type CustomerMessageDraft = {
  id: string;
  anomalyId: string;
  employeeId: string;
  tone: MessageTone;
  subject?: string;
  body: string;
  language: "fi";
  generatedAt: string;
};

export const messageableAnomalyTypes: PayrollAnomaly["type"][] = [
  "missing_tax_card",
  "missing_working_hours",
  "absence_affects_salary",
  "missing_lunch_benefit",
  "final_salary_checklist_incomplete",
  "net_salary_change",
];

export function isMessageableAnomalyType(anomalyType: PayrollAnomaly["type"]) {
  return messageableAnomalyTypes.includes(anomalyType);
}
