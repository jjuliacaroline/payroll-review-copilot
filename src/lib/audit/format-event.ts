import type { AuditEvent } from "./types";
import { getAuditActionLabel, getAuditActorLabel } from "./labels";

export function formatAuditTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatAuditEvent(event: AuditEvent) {
  return {
    actorLabel: getAuditActorLabel(event.actor),
    actionLabel: getAuditActionLabel(event.action),
    timestampLabel: formatAuditTimestamp(event.at),
  };
}
