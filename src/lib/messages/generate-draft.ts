import type { EmployeeRecord, PayrollAnomaly } from "@/lib/domain/types";
import { createId } from "@/lib/utils/id";
import type { CustomerMessageDraft, MessageTone } from "./types";
import { getToneVariant } from "./tone-variants";
import { isMessageableAnomalyType } from "./types";

type GenerateCustomerMessageDraftInput = {
  anomaly: PayrollAnomaly;
  employee: EmployeeRecord;
  tone: MessageTone;
  draftId?: string;
  generatedAt?: string;
};

function subjectForAnomaly(anomaly: PayrollAnomaly, tone: MessageTone) {
  const variant = getToneVariant(tone);
  const subjectByType: Record<PayrollAnomaly["type"], string> = {
    missing_tax_card: "puuttuva verokortti",
    net_salary_change: "palkanmuutoksen vahvistus",
    final_salary_checklist_incomplete: "puuttuva vahvistus loppupalkasta",
    missing_working_hours: "puuttuvat työtunnit",
    tulorekisteri_validation: "Tulorekisteri-tarkistus",
    missing_lunch_benefit: "puuttuva lounasetu",
    absence_affects_salary: "poissaolon tarkennus",
  };

  return `${variant.subjectPrefix}: ${subjectByType[anomaly.type]}`;
}

function contextLineForAnomaly(anomaly: PayrollAnomaly) {
  const contextByType: Record<PayrollAnomaly["type"], string> = {
    missing_tax_card: "Palkka-aineistosta puuttuu ajantasainen verokortti.",
    net_salary_change: "Nettopalkka on muuttunut selvästi edelliseen kuukauteen verrattuna.",
    final_salary_checklist_incomplete: "Loppupalkan tarkistuslista on vielä kesken.",
    missing_working_hours: "Työaikaraportista puuttuvat viimeisen viikon kaksi viimeistä vuoroa.",
    tulorekisteri_validation: "Yksi Tulorekisteri-rivi ei läpäissyt demo-arkiston tarkistusta.",
    missing_lunch_benefit: "Lounasedun aineistossa näyttää olevan yksi puuttuva rivi.",
    absence_affects_salary: "Palkkaan vaikuttava poissaolo osuu palkanmaksujaksolle.",
  };

  return contextByType[anomaly.type];
}

export function generateCustomerMessageDraft({
  anomaly,
  employee,
  tone,
  draftId,
  generatedAt,
}: GenerateCustomerMessageDraftInput): CustomerMessageDraft {
  if (!isMessageableAnomalyType(anomaly.type)) {
    throw new Error("unsupported_anomaly_type");
  }

  const variant = getToneVariant(tone);
  const id = draftId ?? createId("message");
  const at = generatedAt ?? new Date().toISOString();

  return {
    id,
    anomalyId: anomaly.id,
    employeeId: employee.id,
    tone,
    subject: subjectForAnomaly(anomaly, tone),
    body: [
      `Hei ${employee.fullName},`,
      "",
      variant.opener,
      "",
      contextLineForAnomaly(anomaly),
      "",
      variant.request,
      "",
      variant.closingLine,
    ].join("\n"),
    language: "fi",
    generatedAt: at,
  };
}
