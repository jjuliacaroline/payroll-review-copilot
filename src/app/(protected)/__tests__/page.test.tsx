import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardPage from "../page";
import type { DemoSessionPayload } from "@/lib/auth/types";
import { requireDemoSession } from "@/lib/auth/require-demo-session";

vi.mock("@/lib/auth/require-demo-session", () => ({
  requireDemoSession: vi.fn(),
}));

const mockRequireDemoSession = vi.mocked(requireDemoSession);

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
  });

  it("renders the dashboard shell for authenticated users", async () => {
    mockRequireDemoSession.mockResolvedValue(session);

    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).toContain("Demo Company Oy");
    expect(html).toContain("Run highlights");
  });

  it("redirects unauthenticated users", async () => {
    mockRequireDemoSession.mockRejectedValue(new Error("redirect"));

    await expect(DashboardPage()).rejects.toThrow("redirect");
  });
});
