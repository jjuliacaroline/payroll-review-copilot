import type { AuditEvent } from "./types";
import type { AuditEventSeed } from "@/lib/domain/types";
import { mergeAuditEvents } from "./create-event";

export function selectAuditTimeline(
  seedEvents: AuditEventSeed[],
  reviewEvents: AuditEvent[],
) {
  return mergeAuditEvents(seedEvents, reviewEvents);
}
