import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AuditLog from "../audit-log";
import type { AuditEvent } from "@/lib/audit/types";

describe("AuditLog", () => {
  it("renders audit event details", () => {
    const events: AuditEvent[] = [
      {
        id: "audit_01",
        at: "2026-05-19T09:30:00.000Z",
        actor: "system_ai",
        action: "anomaly_detected",
        targetId: "anom_01",
        detail: "Detected something.",
      },
    ];

    const html = renderToStaticMarkup(<AuditLog events={events} />);

    expect(html).toContain("Audit timeline");
    expect(html).toContain("Detected something.");
    expect(html).toContain("Anomaly detected");
  });
});
