import { describe, expect, it } from "vitest";
import { demoAnomalies, demoEmployees, demoAuditSeedEntries, demoChecklistSeed } from "../index";

describe("demo data integrity", () => {
  it("uses 18 unique employees", () => {
    expect(demoEmployees).toHaveLength(18);
    expect(new Set(demoEmployees.map((employee) => employee.id)).size).toBe(18);
  });

  it("links every anomaly to a known employee and keeps anomaly ids unique", () => {
    const employeeIds = new Set(demoEmployees.map((employee) => employee.id));
    const anomalyIds = new Set<string>();

    for (const anomaly of demoAnomalies) {
      expect(employeeIds.has(anomaly.employeeId)).toBe(true);
      anomalyIds.add(anomaly.id);
    }

    expect(anomalyIds.size).toBe(demoAnomalies.length);
  });

  it("keeps the demo seed collections populated", () => {
    expect(demoChecklistSeed).toHaveLength(8);
    expect(demoAuditSeedEntries.length).toBeGreaterThanOrEqual(5);
  });
});

