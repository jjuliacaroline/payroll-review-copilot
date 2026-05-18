import type { AuditEventAction, IgnoreReasonCode } from "./types";

const actionLabels: Record<AuditEventAction, string> = {
  anomaly_opened: "Opened detail view",
  anomaly_marked_reviewed: "Marked as reviewed",
  anomaly_waiting_for_customer: "Asked customer",
  anomaly_ignored: "Ignored with reason",
  customer_message_generated: "Generated customer message",
  customer_message_sent: "Sent customer message",
};

const ignoreReasonLabels: Record<IgnoreReasonCode, string> = {
  false_positive: "False positive",
  already_resolved_outside_system: "Already resolved outside system",
  customer_confirmed_exception: "Customer confirmed exception",
  not_relevant_for_this_run: "Not relevant for this run",
};

export function getAuditActionLabel(action: AuditEventAction) {
  return actionLabels[action];
}

export function getIgnoreReasonLabel(reasonCode: IgnoreReasonCode) {
  return ignoreReasonLabels[reasonCode];
}
