import { describe, expect, it } from "vitest";
import { appendAuditEvent } from "./append-event";
import type { AuditEvent } from "./types";

const baseEvent = (id: string, at: string): AuditEvent => ({
  id,
  at,
  actor: "reviewer",
  action: "anomaly_marked_reviewed",
  targetId: "anom_01",
  detail: "Reviewed.",
});

describe("appendAuditEvent", () => {
  it("appends audit events and caps history", () => {
    const events = [baseEvent("audit_01", "2026-05-18T10:00:00.000Z")];
    const result = appendAuditEvent(events, baseEvent("audit_02", "2026-05-18T11:00:00.000Z"), 2);

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe("audit_02");
  });

  it("removes older entries when the limit is exceeded", () => {
    const events = [
      baseEvent("audit_01", "2026-05-18T10:00:00.000Z"),
      baseEvent("audit_02", "2026-05-18T11:00:00.000Z"),
    ];

    const result = appendAuditEvent(events, baseEvent("audit_03", "2026-05-18T12:00:00.000Z"), 2);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("audit_02");
    expect(result[1].id).toBe("audit_03");
  });
});
