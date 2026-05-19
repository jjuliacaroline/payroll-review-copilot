export type AuditActor = "system_ai" | "reviewer";

export type AuditAction =
  | "anomaly_detected"
  | "checklist_updated"
  | "anomaly_marked_reviewed"
  | "anomaly_waiting_for_customer"
  | "anomaly_ignored"
  | "customer_message_generated"
  | "customer_message_tone_regenerated"
  | "customer_message_sent";

export type AuditEvent = {
  id: string;
  at: string;
  actor: AuditActor;
  action: AuditAction;
  targetId?: string;
  detail: string;
};

export type IgnoreReasonCode =
  | "false_positive"
  | "data_corrected"
  | "duplicate"
  | "policy_exception"
  | "not_relevant_for_this_run";
