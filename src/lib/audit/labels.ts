import type { AuditAction, AuditActor, IgnoreReasonCode } from "./types";

export const ignoreReasonOptions = [
  { value: "false_positive", label: "False positive" },
  { value: "data_corrected", label: "Data corrected" },
  { value: "duplicate", label: "Duplicate anomaly" },
  { value: "policy_exception", label: "Policy exception" },
  { value: "not_relevant_for_this_run", label: "Not relevant for this run" },
] as const;

export type IgnoreReasonOption = (typeof ignoreReasonOptions)[number];

export function isIgnoreReasonCode(value: string): value is IgnoreReasonCode {
  return ignoreReasonOptions.some((option) => option.value === value);
}

export function getIgnoreReasonLabel(code: IgnoreReasonCode) {
  return ignoreReasonOptions.find((option) => option.value === code)?.label ?? "Unknown reason";
}

export function getAuditActorLabel(actor: AuditActor) {
  return actor === "system_ai" ? "System AI" : "Human reviewer";
}

export function getAuditActionLabel(action: AuditAction) {
  switch (action) {
    case "anomaly_detected":
      return "Anomaly detected";
    case "checklist_updated":
      return "Checklist updated";
    case "anomaly_marked_reviewed":
      return "Marked as reviewed";
    case "anomaly_waiting_for_customer":
      return "Asked customer";
    case "anomaly_ignored":
      return "Ignored";
    case "customer_message_generated":
      return "Customer message drafted";
    case "customer_message_tone_regenerated":
      return "Customer message tone updated";
    case "customer_message_sent":
      return "Customer message sent";
    default:
      return "Audit update";
  }
}
