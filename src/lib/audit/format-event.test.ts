import { describe, expect, it } from "vitest";
import { formatAuditEvent } from "./format-event";
import type { AuditEvent } from "./types";

describe("formatAuditEvent", () => {
  it("returns labels for actor, action, and timestamp", () => {
    const event: AuditEvent = {
      id: "audit_01",
      at: "2026-05-19T09:30:00.000Z",
      actor: "system_ai",
      action: "anomaly_detected",
      targetId: "anom_01",
      detail: "Detected something.",
    };

    const formatted = formatAuditEvent(event);

    expect(formatted.actorLabel).toBe("System AI");
    expect(formatted.actionLabel).toBe("Anomaly detected");
    expect(formatted.timestampLabel).toContain("May");
  });
});
