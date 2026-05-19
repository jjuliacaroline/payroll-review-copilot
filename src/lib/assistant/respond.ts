import type { PayrollRunSummary } from "@/lib/payroll/summary";
import type { AnomalyReviewCardViewModel } from "@/lib/review-state/selectors";
import { isMessageableAnomalyType } from "@/lib/messages/types";
import type { AssistantPromptId, AssistantResponse } from "./types";

const resolvedStatuses = new Set(["reviewed", "ignored", "message_sent"]);

function isActionable(card: AnomalyReviewCardViewModel) {
  return !resolvedStatuses.has(card.status);
}

function formatAnomalyLine(card: AnomalyReviewCardViewModel) {
  return `${card.anomaly.title} (${card.employee.fullName})`;
}

function buildPriorities(cards: AnomalyReviewCardViewModel[]) {
  const actionable = cards.filter(isActionable);
  const critical = actionable.filter((card) => card.anomaly.severity === "critical");
  const targets = critical.length > 0 ? critical : actionable;
  return targets.slice(0, 3);
}

export function respondToAssistantPrompt(input: {
  promptId: AssistantPromptId;
  summary: PayrollRunSummary;
  cards: AnomalyReviewCardViewModel[];
}): AssistantResponse {
  const { promptId, summary, cards } = input;
  const now = new Date().toISOString();
  const actionable = cards.filter(isActionable);
  const blockers = actionable.filter((card) => card.anomaly.blockingApproval);

  if (promptId === "check_first") {
    const priorities = buildPriorities(cards);
    const body = priorities.length
      ? `Start with:\n${priorities.map((card) => `- ${formatAnomalyLine(card)}`).join("\n")}`
      : "All anomalies are resolved. Move on to final approval checks.";

    return {
      promptId,
      title: "First checks to run",
      body,
      relatedAnomalyIds: priorities.map((card) => card.anomaly.id),
      generatedAt: now,
    };
  }

  if (promptId === "explain_anomaly") {
    const focus = actionable[0];
    if (!focus) {
      return {
        promptId,
        title: "No open anomalies",
        body: "All anomalies are resolved. Review the checklist and approve when ready.",
        generatedAt: now,
      };
    }

    return {
      promptId,
      title: "Why this anomaly matters",
      body: `The top issue is ${focus.anomaly.title} for ${focus.employee.fullName}. ${focus.anomaly.explanation} Evidence: ${focus.anomaly.evidence} Suggested next action: ${focus.anomaly.suggestedNextAction}`,
      relatedAnomalyIds: [focus.anomaly.id],
      generatedAt: now,
    };
  }

  if (promptId === "draft_customer_message") {
    const messageTarget = actionable.find((card) => isMessageableAnomalyType(card.anomaly.type));
    if (!messageTarget) {
      return {
        promptId,
        title: "No message needed",
        body: "There are no messageable anomalies requiring outreach right now.",
        generatedAt: now,
      };
    }

    return {
      promptId,
      title: "Customer message suggestion",
      body: `Draft a message for ${messageTarget.employee.fullName} about ${messageTarget.anomaly.title}. The goal is to confirm: ${messageTarget.anomaly.suggestedNextAction}`,
      relatedAnomalyIds: [messageTarget.anomaly.id],
      generatedAt: now,
    };
  }

  if (promptId === "summarize_risks") {
    const body = `Critical issues: ${summary.criticalIssues}. Waiting for customer: ${summary.waitingForCustomerInput}. Total anomalies: ${summary.detectedAnomalies}. Approval blockers: ${blockers.length}.`;
    return {
      promptId,
      title: "Payroll risk summary",
      body,
      generatedAt: now,
    };
  }

  const body = blockers.length
    ? `Approval is blocked by:\n${blockers
        .map((card) => `- ${formatAnomalyLine(card)} (${card.status.replace(/_/g, " ")})`)
        .join("\n")}`
    : "No blockers remain. The run can move to approval once the checklist is complete.";

  return {
    promptId,
    title: "Approval blockers",
    body,
    relatedAnomalyIds: blockers.map((card) => card.anomaly.id),
    generatedAt: now,
  };
}
