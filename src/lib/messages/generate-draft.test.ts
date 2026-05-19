import { describe, expect, it } from "vitest";
import { demoAnomalies, demoEmployees } from "@/lib/demo-data";
import { generateCustomerMessageDraft } from "./generate-draft";

describe("generateCustomerMessageDraft", () => {
  it("generates a Finnish draft for missing working hours", () => {
    const anomaly = demoAnomalies.find((candidate) => candidate.id === "anom_missing_working_hours");
    const employee = demoEmployees.find((candidate) => candidate.id === "emp_02");

    expect(anomaly).toBeTruthy();
    expect(employee).toBeTruthy();

    const draft = generateCustomerMessageDraft({
      anomaly: anomaly!,
      employee: employee!,
      tone: "neutral",
      draftId: "message_001",
      generatedAt: "2026-05-18T08:15:00.000Z",
    });

    expect(draft).toEqual({
      id: "message_001",
      anomalyId: "anom_missing_working_hours",
      employeeId: "emp_02",
      tone: "neutral",
      subject: "Täydennyspyyntö: puuttuvat työtunnit",
      body: expect.stringContaining("Mikko Lahtinen"),
      language: "fi",
      generatedAt: "2026-05-18T08:15:00.000Z",
    });
    expect(draft.body).toContain("Työaikaraportista puuttuvat viimeisen viikon kaksi viimeistä vuoroa.");
    expect(draft.body).toContain("Voisitko toimittaa puuttuvat tiedot");
  });

  it("keeps the facts stable while changing tone", () => {
    const anomaly = demoAnomalies.find((candidate) => candidate.id === "anom_missing_working_hours");
    const employee = demoEmployees.find((candidate) => candidate.id === "emp_02");

    const neutralDraft = generateCustomerMessageDraft({
      anomaly: anomaly!,
      employee: employee!,
      tone: "neutral",
      draftId: "message_001",
      generatedAt: "2026-05-18T08:15:00.000Z",
    });

    const urgentDraft = generateCustomerMessageDraft({
      anomaly: anomaly!,
      employee: employee!,
      tone: "polite_urgent",
      draftId: "message_002",
      generatedAt: "2026-05-18T08:16:00.000Z",
    });

    expect(neutralDraft.body).toContain("Työaikaraportista puuttuvat viimeisen viikon kaksi viimeistä vuoroa.");
    expect(urgentDraft.body).toContain("Työaikaraportista puuttuvat viimeisen viikon kaksi viimeistä vuoroa.");
    expect(neutralDraft.body).not.toBe(urgentDraft.body);
    expect(urgentDraft.subject).toContain("Kiireellinen täydennyspyyntö");
  });

  it("returns the same draft text for the same anomaly and tone", () => {
    const anomaly = demoAnomalies.find((candidate) => candidate.id === "anom_missing_working_hours");
    const employee = demoEmployees.find((candidate) => candidate.id === "emp_02");

    const firstDraft = generateCustomerMessageDraft({
      anomaly: anomaly!,
      employee: employee!,
      tone: "neutral",
      draftId: "message_001",
      generatedAt: "2026-05-18T08:15:00.000Z",
    });
    const secondDraft = generateCustomerMessageDraft({
      anomaly: anomaly!,
      employee: employee!,
      tone: "neutral",
      draftId: "message_002",
      generatedAt: "2026-05-18T08:20:00.000Z",
    });

    expect(firstDraft.subject).toBe(secondDraft.subject);
    expect(firstDraft.body).toBe(secondDraft.body);
  });

  it("rejects unsupported anomaly types", () => {
    const anomaly = demoAnomalies.find((candidate) => candidate.id === "anom_tulorekisteri_validation");
    const employee = demoEmployees.find((candidate) => candidate.id === "emp_13");

    expect(() =>
      generateCustomerMessageDraft({
        anomaly: anomaly!,
        employee: employee!,
        tone: "neutral",
      }),
    ).toThrowError("unsupported_anomaly_type");
  });
});
