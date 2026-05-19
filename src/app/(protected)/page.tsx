import React from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import PayrollRunSummary from "@/components/dashboard/payroll-run-summary";
import ReviewGovernanceBanner from "@/components/dashboard/review-governance-banner";
import PageSection from "@/components/layout/page-section";
import { payrollRunSummary } from "@/lib/payroll/summary";
import AnomalyList from "@/components/anomalies/anomaly-list";
import PayrollAssistantPanel from "@/components/assistant/payroll-assistant-panel";
import PayrollReadinessChecklist from "@/components/checklist/payroll-readiness-checklist";
import ApprovalStatusCard from "@/components/checklist/approval-status-card";
import { demoAnomalies, demoAuditSeedEntries, demoEmployees } from "@/lib/demo-data";
import { loadDemoReviewState } from "@/lib/review-state/session-state";
import { selectAnomalyReviewCards, selectLivePayrollRunSummary } from "@/lib/review-state/selectors";
import { mergeAuditEvents } from "@/lib/audit/create-event";
import { deriveChecklistItems } from "@/lib/checklist/derive-checklist";

export default async function DashboardPage() {
  const session = await requireDemoSession();
  const reviewState = await loadDemoReviewState(session.sessionId);
  const liveSummary = selectLivePayrollRunSummary(payrollRunSummary, demoAnomalies, reviewState);
  const anomalyCards = selectAnomalyReviewCards(demoAnomalies, demoEmployees, reviewState);
  const auditEvents = mergeAuditEvents(demoAuditSeedEntries, reviewState.auditEvents);
  const checklistItems = deriveChecklistItems({
    anomalies: demoAnomalies,
    reviewState,
  });
  const readyForApproval = checklistItems.find((item) => item.key === "ready_for_approval");
  const checklistRows = checklistItems.filter((item) => item.key !== "ready_for_approval");

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <AnomalyList cards={anomalyCards} auditEvents={auditEvents} />
          <PayrollAssistantPanel summary={liveSummary} cards={anomalyCards} />
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <PayrollReadinessChecklist items={checklistRows} />
          {readyForApproval ? <ApprovalStatusCard item={readyForApproval} /> : null}
        </div>
      </PageSection>
    </div>
  );
}
