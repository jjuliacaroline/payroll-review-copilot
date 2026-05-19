import type { AssistantPrompt } from "./types";

export const assistantPrompts: AssistantPrompt[] = [
  {
    id: "check_first",
    label: "What should I check first?",
    description: "Prioritize the highest risk payroll items.",
  },
  {
    id: "explain_anomaly",
    label: "Explain the top anomaly",
    description: "Summarize why the leading anomaly matters.",
  },
  {
    id: "draft_customer_message",
    label: "Draft customer message",
    description: "Recommend the best message to send next.",
  },
  {
    id: "summarize_risks",
    label: "Summarize payroll risks",
    description: "Provide a quick risk snapshot for this run.",
  },
  {
    id: "approval_blockers",
    label: "Approval blockers",
    description: "List what still blocks payroll approval.",
  },
];
