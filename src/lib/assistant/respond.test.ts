import { describe, expect, it } from "vitest";
import { respondToAssistantPrompt } from "./respond";
import { demoAnomalies, demoEmployees } from "@/lib/demo-data";
import { createInitialDemoReviewState } from "@/lib/review-state/reducers";
import { selectAnomalyReviewCards, selectLivePayrollRunSummary } from "@/lib/review-state/selectors";
import { payrollRunSummary } from "@/lib/payroll/summary";

const reviewState = createInitialDemoReviewState();
const cards = selectAnomalyReviewCards(demoAnomalies, demoEmployees, reviewState);
const summary = selectLivePayrollRunSummary(payrollRunSummary, demoAnomalies, reviewState);

describe("respondToAssistantPrompt", () => {
  it("summarizes payroll risks", () => {
    const response = respondToAssistantPrompt({
      promptId: "summarize_risks",
      summary,
      cards,
    });

    expect(response.title).toBe("Payroll risk summary");
    expect(response.body).toContain("Critical issues: 2");
    expect(response.body).toContain("Waiting for customer: 3");
  });

  it("prioritizes the highest risk anomalies", () => {
    const response = respondToAssistantPrompt({
      promptId: "check_first",
      summary,
      cards,
    });

    expect(response.title).toBe("First checks to run");
    expect(response.body).toContain("Missing tax card data");
  });

  it("explains the top anomaly", () => {
    const response = respondToAssistantPrompt({
      promptId: "explain_anomaly",
      summary,
      cards,
    });

    expect(response.title).toBe("Why this anomaly matters");
    expect(response.body).toContain("Missing tax card data");
  });

  it("suggests a customer message", () => {
    const response = respondToAssistantPrompt({
      promptId: "draft_customer_message",
      summary,
      cards,
    });

    expect(response.title).toBe("Customer message suggestion");
    expect(response.body).toContain("Missing tax card data");
  });

  it("lists approval blockers", () => {
    const response = respondToAssistantPrompt({
      promptId: "approval_blockers",
      summary,
      cards,
    });

    expect(response.title).toBe("Approval blockers");
    expect(response.body).toContain("Missing tax card data");
  });
});
