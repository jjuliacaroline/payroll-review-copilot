import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardPage from "../page";
import type { DemoSessionPayload } from "@/lib/auth/types";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import { payrollRunSummary } from "@/lib/payroll/summary";
import { loadDemoReviewState } from "@/lib/review-state/session-state";

vi.mock("@/lib/auth/require-demo-session", () => ({
  requireDemoSession: vi.fn(),
}));

vi.mock("@/lib/review-state/session-state", () => ({
  loadDemoReviewState: vi.fn(),
}));

vi.mock("@/components/anomalies/anomaly-list", () => ({
  default: () => <div>Mock anomaly list</div>,
}));

const mockRequireDemoSession = vi.mocked(requireDemoSession);
const mockLoadDemoReviewState = vi.mocked(loadDemoReviewState);

const session: DemoSessionPayload = {
  type: "demo_session",
  sessionId: "session_test",
  reviewerLabel: "Test Reviewer",
  role: "reviewer",
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

describe("DashboardPage", () => {
  beforeEach(() => {
    mockRequireDemoSession.mockReset();
    mockLoadDemoReviewState.mockReset();
  });

  it("renders the dashboard shell for authenticated users", async () => {
    mockRequireDemoSession.mockResolvedValue(session);
    mockLoadDemoReviewState.mockResolvedValue({
      anomalyStates: {},
      auditEvents: [],
    });

    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).toContain("Demo Company Oy");
    expect(html).toContain("Run highlights");
    expect(html).toContain(String(payrollRunSummary.employeeCount));
    expect(html).toContain("Audit timeline");
  });

  it("redirects unauthenticated users", async () => {
    mockRequireDemoSession.mockRejectedValue(new Error("redirect"));

    await expect(DashboardPage()).rejects.toThrow("redirect");
  });
});
