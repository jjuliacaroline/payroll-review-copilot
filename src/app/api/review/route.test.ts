import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { getOptionalDemoSession } from "@/lib/auth/require-demo-session";
import { loadDemoReviewState } from "@/lib/review-state/session-state";

vi.mock("@/lib/auth/require-demo-session", () => ({
  getOptionalDemoSession: vi.fn(),
}));

vi.mock("@/lib/review-state/session-state", () => ({
  loadDemoReviewState: vi.fn(),
  setDemoReviewStateCookie: vi.fn().mockResolvedValue(undefined),
}));

const mockGetOptionalDemoSession = vi.mocked(getOptionalDemoSession);
const mockLoadDemoReviewState = vi.mocked(loadDemoReviewState);

function makeRequest(origin: string, body: Record<string, unknown>, cookie = "demo") {
  return new NextRequest("http://127.0.0.1:3001/api/review", {
    method: "POST",
    headers: {
      origin,
      cookie,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("review route", () => {
  it("rejects unauthenticated requests", async () => {
    mockGetOptionalDemoSession.mockResolvedValue(null);
    const request = makeRequest("http://127.0.0.1:3001", {
      anomalyId: "anom_missing_tax_card",
      action: "mark_as_reviewed",
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("rejects invalid origins", async () => {
    mockGetOptionalDemoSession.mockResolvedValue({
      type: "demo_session",
      sessionId: "session_123",
      reviewerLabel: "Reviewer",
      role: "reviewer",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    const request = makeRequest("http://evil.example", {
      anomalyId: "anom_missing_tax_card",
      action: "mark_as_reviewed",
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it("accepts reviewed mutations", async () => {
    mockGetOptionalDemoSession.mockResolvedValue({
      type: "demo_session",
      sessionId: "session_123",
      reviewerLabel: "Reviewer",
      role: "reviewer",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    mockLoadDemoReviewState.mockResolvedValue({
      anomalyStates: {},
      auditEvents: [],
    });

    const request = makeRequest("http://127.0.0.1:3001", {
      anomalyId: "anom_missing_tax_card",
      action: "mark_as_reviewed",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});

