export type IgnoreReasonCode =
  | "false_positive"
  | "already_resolved_outside_system"
  | "customer_confirmed_exception"
  | "not_relevant_for_this_run";

export type AuditEventAction =
  | "anomaly_opened"
  | "anomaly_marked_reviewed"
  | "anomaly_waiting_for_customer"
  | "anomaly_ignored"
  | "customer_message_generated"
  | "customer_message_sent";

export type AuditEventActor = "reviewer" | "system_ai";

export type AuditEvent = {
  id: string;
  at: string;
  actor: AuditEventActor;
  action: AuditEventAction;
  targetId: string;
  detail: string;
  meta?: {
    reasonCode?: IgnoreReasonCode;
    note?: string;
  };
};
