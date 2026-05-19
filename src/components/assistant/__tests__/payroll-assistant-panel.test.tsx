import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PayrollAssistantPanel from "../payroll-assistant-panel";
import { demoAnomalies, demoEmployees } from "@/lib/demo-data";
import { createInitialDemoReviewState } from "@/lib/review-state/reducers";
import { selectAnomalyReviewCards, selectLivePayrollRunSummary } from "@/lib/review-state/selectors";
import { payrollRunSummary } from "@/lib/payroll/summary";

const reviewState = createInitialDemoReviewState();
const cards = selectAnomalyReviewCards(demoAnomalies, demoEmployees, reviewState);
const summary = selectLivePayrollRunSummary(payrollRunSummary, demoAnomalies, reviewState);

describe("PayrollAssistantPanel", () => {
  it("renders the prompt chips and helper copy", () => {
    const html = renderToStaticMarkup(<PayrollAssistantPanel summary={summary} cards={cards} />);

    expect(html).toContain("Payroll AI guidance");
    expect(html).toContain("What should I check first?");
    expect(html).toContain("Explain the top anomaly");
    expect(html).toContain("Draft customer message");
    expect(html).toContain("Summarize payroll risks");
    expect(html).toContain("Approval blockers");
  });
});
