export type DemoInviteTokenPayload = {
  type: "demo_invite";
  inviteId: string;
  reviewerLabel: string;
  role: "reviewer";
  exp: number;
  iat: number;
  iss: "payroll-review-copilot";
  aud: "demo-access";
};

export type DemoSessionPayload = {
  type: "demo_session";
  sessionId: string;
  reviewerLabel: string;
  role: "reviewer";
  issuedAt: string;
  expiresAt: string;
};
