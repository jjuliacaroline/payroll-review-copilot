export type AssistantPromptId =
  | "check_first"
  | "explain_anomaly"
  | "draft_customer_message"
  | "summarize_risks"
  | "approval_blockers";

export type AssistantPrompt = {
  id: AssistantPromptId;
  label: string;
  description: string;
};

export type AssistantResponse = {
  promptId: AssistantPromptId;
  title: string;
  body: string;
  relatedAnomalyIds?: string[];
  generatedAt: string;
};
