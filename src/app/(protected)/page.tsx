import React from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import PayrollRunSummary from "@/components/dashboard/payroll-run-summary";
import ReviewGovernanceBanner from "@/components/dashboard/review-governance-banner";
import PageSection from "@/components/layout/page-section";
import { payrollRunSummary } from "@/lib/payroll/summary";

export default async function DashboardPage() {
  await requireDemoSession();

  return (
    <div className="space-y-6">
      <PageSection>
        <DashboardHeader summary={payrollRunSummary} />
      </PageSection>
      <PageSection>
        <PayrollRunSummary summary={payrollRunSummary} />
      </PageSection>
      <PageSection>
        <ReviewGovernanceBanner />
      </PageSection>
    </div>
  );
}
