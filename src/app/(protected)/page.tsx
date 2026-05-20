import React from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import { loadDemoReviewState } from "@/lib/review-state/session-state";
import DemoDashboardClient from "@/components/dashboard/demo-dashboard-client";

export default async function DashboardPage() {
  const session = await requireDemoSession();
  const reviewState = await loadDemoReviewState(session.sessionId);

  return <DemoDashboardClient initialReviewState={reviewState} reviewerLabel={session.reviewerLabel} />;
}
