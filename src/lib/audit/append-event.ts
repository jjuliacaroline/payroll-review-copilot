import type { AuditEvent } from "./types";

export function appendAuditEvent(
  events: AuditEvent[],
  nextEvent: AuditEvent,
  limit = 50,
) {
  return [...events, nextEvent].slice(-limit);
}
