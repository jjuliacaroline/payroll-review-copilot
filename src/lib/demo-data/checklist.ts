import type { ChecklistItemKey } from "@/lib/domain/types";

export type DemoChecklistSeedItem = {
  key: ChecklistItemKey;
  label: string;
  status: "complete" | "incomplete" | "blocked";
  detail: string;
};

export const demoChecklistSeed: DemoChecklistSeedItem[] = [
  {
    key: "employee_data_checked",
    label: "Employee data checked",
    status: "complete",
    detail: "All 18 demo employee profiles are populated with consistent payroll metadata.",
  },
  {
    key: "tax_card_data_checked",
    label: "Tax card data checked",
    status: "blocked",
    detail: "One employee still has a missing tax card import and needs a customer update.",
  },
  {
    key: "absences_checked",
    label: "Absences checked",
    status: "blocked",
    detail: "One unpaid absence changes salary and needs confirmation before approval.",
  },
  {
    key: "benefits_checked",
    label: "Benefits checked",
    status: "complete",
    detail: "The demo benefit feed is present, with one informational lunch benefit note.",
  },
  {
    key: "final_salary_cases_checked",
    label: "Final salary cases checked",
    status: "incomplete",
    detail: "A final salary checklist item remains open in the demo approval flow.",
  },
  {
    key: "customer_missing_info_resolved",
    label: "Customer missing info resolved",
    status: "incomplete",
    detail: "The customer still needs to answer the outstanding working hours and tax card questions.",
  },
  {
    key: "tulorekisteri_validation_checked",
    label: "Tulorekisteri validation checked",
    status: "blocked",
    detail: "The reporting export has one validation issue left to correct.",
  },
  {
    key: "ready_for_approval",
    label: "Ready for approval",
    status: "incomplete",
    detail: "The payroll run is not ready because critical and waiting-for-customer issues remain.",
  },
];

