import type { AuditEventSeed } from "@/lib/domain/types";
import { createId } from "@/lib/utils/id";
import type { AuditAction, AuditActor, AuditEvent } from "./types";

export function createAuditEvent(input: {
  actor: AuditActor;
  action: AuditAction;
  detail: string;
  targetId?: string;
  at?: string;
  id?: string;
}): AuditEvent {
  return {
    id: input.id ?? createId("audit"),
    at: input.at ?? new Date().toISOString(),
    actor: input.actor,
    action: input.action,
    targetId: input.targetId,
    detail: input.detail,
  };
}

export function seedAuditEventToAuditEvent(seed: AuditEventSeed): AuditEvent {
  return {
    id: seed.id,
    at: seed.at,
    actor: seed.actor,
    action: seed.action as AuditAction,
    targetId: seed.targetId,
    detail: seed.detail,
  };
}

export function mergeAuditEvents(seedEvents: AuditEventSeed[], reviewEvents: AuditEvent[]) {
  return [...seedEvents.map(seedAuditEventToAuditEvent), ...reviewEvents].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime(),
  );
}
