import React from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import PayrollRunSummary from "@/components/dashboard/payroll-run-summary";
import ReviewGovernanceBanner from "@/components/dashboard/review-governance-banner";
import PageSection from "@/components/layout/page-section";
import { payrollRunSummary } from "@/lib/payroll/summary";
import AnomalyList from "@/components/anomalies/anomaly-list";
import { demoAnomalies, demoEmployees } from "@/lib/demo-data";
import { loadDemoReviewState } from "@/lib/review-state/session-state";
import { selectAnomalyReviewCards, selectLivePayrollRunSummary } from "@/lib/review-state/selectors";

export default async function DashboardPage() {
  const session = await requireDemoSession();
  const reviewState = await loadDemoReviewState(session.sessionId);
  const liveSummary = selectLivePayrollRunSummary(payrollRunSummary, demoAnomalies, reviewState);
  const anomalyCards = selectAnomalyReviewCards(demoAnomalies, demoEmployees, reviewState);

  return (
    <div className="space-y-6">
      <PageSection>
        <DashboardHeader summary={liveSummary} />
      </PageSection>
      <PageSection>
        <PayrollRunSummary summary={liveSummary} />
      </PageSection>
      <PageSection>
        <ReviewGovernanceBanner />
      </PageSection>
      <PageSection>
        <AnomalyList cards={anomalyCards} />
      </PageSection>
    </div>
  );
}
