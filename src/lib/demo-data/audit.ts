import type { AuditEventSeed } from "@/lib/domain/types";

export const demoAuditSeedEntries: AuditEventSeed[] = [
  {
    id: "audit_01",
    at: "2026-05-18T06:15:00.000Z",
    actor: "system_ai",
    action: "anomaly_detected",
    targetId: "anom_missing_tax_card",
    detail: "Detected missing tax card data while composing the May payroll review queue.",
  },
  {
    id: "audit_02",
    at: "2026-05-18T06:17:00.000Z",
    actor: "system_ai",
    action: "anomaly_detected",
    targetId: "anom_tulorekisteri_validation",
    detail: "Flagged one Tulorekisteri validation issue in the demo payroll export.",
  },
  {
    id: "audit_03",
    at: "2026-05-18T06:21:00.000Z",
    actor: "system_ai",
    action: "checklist_updated",
    targetId: "ready_for_approval",
    detail: "Derived checklist inputs show the payroll run is not yet ready for approval.",
  },
  {
    id: "audit_04",
    at: "2026-05-18T06:25:00.000Z",
    actor: "system_ai",
    action: "anomaly_detected",
    targetId: "anom_missing_working_hours",
    detail: "Highlighted a missing timesheet segment that requires customer confirmation.",
  },
  {
    id: "audit_05",
    at: "2026-05-18T06:30:00.000Z",
    actor: "system_ai",
    action: "anomaly_detected",
    targetId: "anom_absence_affects_salary",
    detail: "Detected an absence that changes the employee's salary calculation.",
  },
];

