# Implementation Plan

## Summary

Build a deployable `Next.js + TypeScript` demo app calledd **Payroll Review Copilot** with secure invite-link access, one authenticated payroll-review dashboard, deterministic AI-assist flows, session-scoped interaction state, and a professional README. The product is intentionally backend-light: all payroll content is fake static seed data, while reviewer actions are persisted only in the authenticated server session for the duration of the demo.

Architecture defaults:

- Framework: `Next.js` App Router
- Styling: `Tailwind CSS`
- Tests: `Vitest`, `React Testing Library`, optional `Playwright` for one auth smoke test if time allows
- Token signing: `jose`
- State persistence: secure signed session cookie, no database
- Deployment target: Vercel
- Primary UI language: English
- Finnish content: payroll terminology where appropriate and customer message drafts
- update README.md when needed

---

## Step 1: Demo access and authentication

### Goal
Implement a secure, low-friction demo access flow based on signed expiring invite links, server-side token validation, and an authenticated session stored in an `httpOnly` cookie.

### Implementation details

#### Chosen auth model
Use **pre-generated invite links** instead of email magic links.

Reasoning:
- No SMTP/provider setup required
- Fewer delivery and spam issues
- Still secure enough for a demo when links are signed and short-lived
- Easier to document for private demo sharing

#### Token library / signing approach
Use `jose` with `HS256` signed JWTs.

Recommended package:
- `jose`

Rationale:
- Mature library
- Clear JWT signing/verification API
- Suitable for stateless invite tokens and short session tokens

#### Invite token payload shape
Create TypeScript type:

```ts
type DemoInviteTokenPayload = {
  type: "demo_invite";
  inviteId: string;
  reviewerLabel: string;
  role: "reviewer";
  exp: number;
  iat: number;
  iss: "payroll-review-copilot";
  aud: "demo-access";
};
```

Notes:
- `inviteId` identifies the generated invite instance for audit copy and debugging
- `reviewerLabel` is a human-friendly label such as `"Demo Reviewer"`
- `role` is fixed to `reviewer`
- `exp` and `iat` are Unix timestamps
- `iss` and `aud` must be verified during validation

#### Session payload shape
Create TypeScript type:

```ts
type DemoSessionPayload = {
  type: "demo_session";
  sessionId: string;
  reviewerLabel: string;
  role: "reviewer";
  issuedAt: string;
  expiresAt: string;
};
```

Notes:
- `sessionId` should be unique per redeemed invite session
- `issuedAt` and `expiresAt` use ISO strings for display/logging convenience
- Session contains no secrets and no payroll data

#### Environment variable names
Add exact env vars:

```env
DEMO_INVITE_SECRET=
DEMO_SESSION_SECRET=
DEMO_BASE_URL=
DEMO_INVITE_MAX_AGE_HOURS=72
DEMO_SESSION_MAX_AGE_HOURS=12
```

Rules:
- `DEMO_INVITE_SECRET`: used only for invite token signing/verification
- `DEMO_SESSION_SECRET`: used only for session token signing/verification
- `DEMO_BASE_URL`: used by invite generation script to print a full shareable URL
- `DEMO_INVITE_MAX_AGE_HOURS`: default 72
- `DEMO_SESSION_MAX_AGE_HOURS`: default 12

#### Cookie name
Use exact cookie name:

```ts
const DEMO_SESSION_COOKIE_NAME = "payroll_review_demo_session";
```

Cookie settings:
- `httpOnly: true`
- `secure: process.env.NODE_ENV === "production"`
- `sameSite: "lax"`
- `path: "/"`

#### Session expiry
- Default session expiry: `12 hours`
- Session should be refreshed only by re-entering via a valid invite link, not on every request
- Expired session should redirect to `/access/session-expired`

#### Invite token expiry
- Default invite token expiry: `72 hours`
- Script should allow overriding with a CLI flag later if needed, but default plan is enough for first pass
- Expired invite should show a dedicated access error state, not a generic 500 page

#### Exact routes to create
Create these exact routes:

- `/access`
  - Reads `token` query param
  - Shows access/redeem page
- `/access/invalid`
  - Invalid or malformed token state
- `/access/expired`
  - Expired invite state
- `/access/session-expired`
  - Expired session state with instructions
- `/logout`
  - Clears session cookie and redirects to `/access/logged-out`
- `/access/logged-out`
  - Logged-out confirmation state
- `/`
  - Protected dashboard route
- Optional route group:
  - `src/app/(protected)/page.tsx` for dashboard
  - `src/app/(public)/access/...` for unauthenticated screens

#### Exact protected-route behavior
Protected routes:
- `/`
- any future routes under `/(protected)`

Behavior:
- If no valid session cookie: redirect to `/access`
- If session cookie exists but signature invalid: clear cookie and redirect to `/access/invalid`
- If session cookie expired: clear cookie and redirect to `/access/session-expired`
- If session valid: allow render

Do not allow the dashboard to render partially before redirect.

Recommended implementation:
- Shared server-side helper `requireDemoSession()`
- Use this helper inside protected page/layout
- Middleware is optional; prefer server-side guards in layout/page for clarity and fewer edge cases in Step 1

#### Access page behavior
`/access` states:

1. `?token=` present and valid
- Verify token
- Create session token
- Set cookie
- Redirect to `/`

2. `?token=` present and expired
- Redirect to `/access/expired`

3. `?token=` present and invalid
- Redirect to `/access/invalid`

4. No `token` query and already authenticated
- Redirect to `/`

5. No `token` query and not authenticated
- Show professional info page:
  - Title: `Demo access required`
  - Short explanation that access is granted through a secure invite link
  - No password fields
  - No account creation

#### Logout behavior
`/logout` route should:
- Clear `payroll_review_demo_session`
- Redirect to `/access/logged-out`

Do not require confirmation modal in Step 1.

#### Invalid/expired token behavior
Invalid token page should:
- Explain the link is invalid or malformed
- Ask the reviewer to request a fresh invite
- Never leak verification details

Expired token page should:
- Explain the link has expired
- Ask the reviewer to request a new invite
- Optionally show support copy like `Ask the sender for a fresh demo link`

Do not expose stack traces or raw JWT errors in the UI.

#### Local development behavior
Local dev defaults:
- `secure` cookie flag is `false`
- Developer manually generates invite link via script
- Access route works on `http://localhost:3000`
- README later documents exact command

Example local flow:
1. Set env vars in `.env.local`
2. Run `npm run generate:demo-invite -- --reviewer "Local Reviewer"`
3. Open generated URL
4. Session cookie is set
5. Access dashboard

#### Production deployment behavior
On Vercel:
- Configure env vars in project settings
- `DEMO_BASE_URL` equals deployed URL, for example `https://payroll-review-copilot.vercel.app`
- Cookie `secure` flag is enabled
- Invite link generated locally or through a one-off server utility using production secrets
- Reviewer receives a direct link like: `https://your-demo-domain/access?token=...`

#### Whether CSRF is needed
Decision: **Do not add explicit CSRF protection in Step 1**

Reasoning:
- Step 1 only introduces invite redemption and logout
- Invite redemption is driven by a URL token, not a cookie-authenticated side effect
- Logout is low-risk and acceptable with `sameSite=lax`
- Subsequent state-changing authenticated POST actions in later steps should be implemented via server actions or POST route handlers and evaluated for CSRF exposure then

Security note to document in the plan:
- Because the demo relies on cookie-authenticated mutation after login, later steps should avoid cross-site form endpoints without origin validation. If using route handlers for state mutations, add `Origin`/`Host` checks in the shared mutation layer in Step 4 or Step 5.

#### Exact utility/service modules to create
Create these exact modules:

- `src/lib/auth/auth-config.ts`
  - Reads env vars
  - Exports constants like cookie name, issuer, audience, max ages

- `src/lib/auth/types.ts`
  - `DemoInviteTokenPayload`
  - `DemoSessionPayload`

- `src/lib/auth/invite-token.ts`
  - `createDemoInviteToken(input)`
  - `verifyDemoInviteToken(token)`

- `src/lib/auth/session-token.ts`
  - `createDemoSessionToken(input)`
  - `verifyDemoSessionToken(token)`

- `src/lib/auth/session-cookie.ts`
  - `setDemoSessionCookie()`
  - `clearDemoSessionCookie()`
  - `readDemoSessionCookie()`

- `src/lib/auth/require-demo-session.ts`
  - `requireDemoSession()`
  - `getOptionalDemoSession()`

- `src/lib/auth/invite-url.ts`
  - `buildDemoInviteUrl(token)`

- `src/lib/utils/id.ts`
  - `createId()` or `createSessionId()`

#### Exact components to create
Create these exact components:

- `src/components/auth/access-state-card.tsx`
- `src/components/auth/access-status-panel.tsx`

Pages can compose these small components rather than duplicating status UI.

#### Exact files to create
Create these exact files:

- `src/app/access/page.tsx`
- `src/app/access/invalid/page.tsx`
- `src/app/access/expired/page.tsx`
- `src/app/access/session-expired/page.tsx`
- `src/app/access/logged-out/page.tsx`
- `src/app/logout/route.ts`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/page.tsx`
- `src/components/auth/access-state-card.tsx`
- `src/components/auth/access-status-panel.tsx`
- `src/lib/auth/auth-config.ts`
- `src/lib/auth/types.ts`
- `src/lib/auth/invite-token.ts`
- `src/lib/auth/session-token.ts`
- `src/lib/auth/session-cookie.ts`
- `src/lib/auth/require-demo-session.ts`
- `src/lib/auth/invite-url.ts`
- `src/lib/utils/id.ts`
- `scripts/generate-demo-invite.ts`
- `.env.example`

#### Exact user interactions
- User opens invite link
- System validates token and enters session
- User is redirected to dashboard
- User revisits `/access` while signed in and is redirected to dashboard
- User opens invalid link and sees invalid state
- User opens expired link and sees expired state
- User logs out and sees logged-out confirmation
- User with expired session is redirected to session-expired page

#### Acceptance criteria
- Invite link redemption works with a signed JWT token
- Invite token validation checks signature, issuer, audience, and expiry
- A valid invite creates a signed session cookie and redirects to `/`
- Protected routes cannot be accessed without a valid session
- Invalid or expired tokens do not create a session
- Logout clears the session cookie
- Session and invite secrets are never exposed client-side
- All auth pages have polished, non-technical error copy
- Local and production cookie behavior differ correctly by `NODE_ENV`

#### Manual test checklist
- Generate a local invite link and verify it opens the dashboard
- Remove the cookie and verify `/` redirects to `/access`
- Paste an obviously invalid token and verify redirect to `/access/invalid`
- Generate an expired token manually or shorten expiry and verify redirect to `/access/expired`
- Sign in, then visit `/access` again and verify redirect to `/`
- Sign in, then hit `/logout` and verify redirect to `/access/logged-out`
- After logout, verify `/` redirects to `/access`
- In production preview, verify cookie has `Secure` and `HttpOnly`
- Confirm page copy does not mention raw JWT/stack details

#### Automated tests to add
Unit tests:
- `invite-token.test.ts`
  - creates valid token
  - rejects wrong issuer
  - rejects wrong audience
  - rejects expired token
  - rejects malformed token

- `session-token.test.ts`
  - creates valid session token
  - rejects expired session
  - rejects wrong secret / invalid signature

- `auth-config.test.ts`
  - parses env defaults correctly
  - throws on missing required secrets

Route / integration tests:
- `/access` with valid token sets session and redirects
- `/access` with invalid token redirects to `/access/invalid`
- `/access` with expired token redirects to `/access/expired`
- protected route without session redirects to `/access`
- `/logout` clears cookie and redirects

Optional browser smoke test:
- generate invite
- visit invite
- land on dashboard
- logout
- redirected to logged-out page

#### Security details
- Separate secrets for invite tokens and session tokens
- Use short-lived invite and session durations
- Store only non-sensitive session metadata in cookies
- Use `httpOnly` to prevent JS access
- Use `secure` in production
- Use `sameSite=lax` to reduce cross-site cookie submission risk
- Do not log raw invite tokens in browser console
- Do not render secret-derived data into HTML

### Files likely to change
- `package.json`
- `src/app/access/page.tsx`
- `src/app/access/invalid/page.tsx`
- `src/app/access/expired/page.tsx`
- `src/app/access/session-expired/page.tsx`
- `src/app/access/logged-out/page.tsx`
- `src/app/logout/route.ts`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/page.tsx`
- `src/components/auth/access-state-card.tsx`
- `src/components/auth/access-status-panel.tsx`
- `src/lib/auth/*`
- `src/lib/utils/id.ts`
- `scripts/generate-demo-invite.ts`
- `.env.example`

### Tests/checks
- Unit tests for token creation and verification
- Route tests for invite redemption and protected-route redirects
- Manual cookie verification in dev and preview deployment
- Optional Playwright smoke test for full invite-login-logout flow

### Suggested commit message
`feat(auth): add signed invite-link demo access and secure reviewer session`

---

## Step 2: Main payroll dashboard shell

### Goal
Create the authenticated dashboard shell for one payroll run with enterprise-grade information hierarchy and clear human-in-the-loop framing.

### Implementation details

#### Exact route names
- `/` for the main dashboard
- keep rendered within `src/app/(protected)/page.tsx`

#### Exact key components to create
- `src/components/dashboard/dashboard-header.tsx`
- `src/components/dashboard/payroll-run-summary.tsx`
- `src/components/dashboard/summary-card.tsx`
- `src/components/dashboard/review-governance-banner.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/topbar.tsx`
- `src/components/layout/page-section.tsx`

#### Exact utility/service modules to create
- `src/lib/ui/navigation.ts`
- `src/lib/format/date.ts`
- `src/lib/format/number.ts`

#### Exact state shape / TypeScript types
Create or plan these types now if not already introduced in Step 3:

```ts
type PayrollRunStatus = "review_in_progress" | "ready_for_approval";

type PayrollRunSummary = {
  companyName: string;
  payrollPeriodLabel: string;
  paymentDate: string;
  employeeCount: number;
  status: PayrollRunStatus;
  detectedAnomalies: number;
  criticalIssues: number;
  waitingForCustomerInput: number;
  estimatedTimeSavedMinutes: number;
};
```

#### Exact user interactions
- Authenticated user lands on dashboard
- User sees top bar with product name and logout action
- User sees payroll run title and metadata
- User sees summary cards
- User sees governance banner with explicit AI/human control message

#### Acceptance criteria
- Dashboard renders only for authenticated sessions
- Header includes:
  - `Demo Company Oy`
  - `May 2026`
  - `Payment date 31.5.2026`
  - `18 employees`
  - status badge `Review in progress`
- Summary cards show:
  - Total employees
  - Detected anomalies
  - Critical issues
  - Items waiting for customer input
  - Estimated time saved
- Governance banner clearly communicates:
  - AI suggests
  - Human reviews
  - Human approves
  - All decisions are logged
- Layout works at mobile, tablet, and desktop widths

#### Manual test checklist
- Sign in and verify dashboard is visible
- Verify logout action is visible and works
- Verify summary cards do not wrap awkwardly on laptop width
- Verify governance banner remains visible without looking like an alert error
- Verify tab order is logical

#### Automated tests to add
- `dashboard-header.test.tsx`
- `review-governance-banner.test.tsx`
- authenticated dashboard render test
- redirect test for unauthenticated dashboard access

#### Security details
- No payroll data is loaded unless `requireDemoSession()` passes
- No user-specific secrets appear in rendered page props

### Files likely to change
- `src/app/(protected)/page.tsx`
- `src/components/dashboard/*`
- `src/components/layout/*`
- `src/lib/format/*`

### Tests/checks
- Component render tests
- Responsive manual check
- Accessibility spot check for headings and landmarks

### Suggested commit message
`feat(app): add payroll dashboard shell and governance framing`

---

## Step 3: Demo data model and fake payroll data

### Goal
Create a coherent fake data layer for one payroll run, 18 fake employees, anomalies, checklist inputs, and audit seed entries.

### Implementation details

#### Exact utility/service modules to create
- `src/lib/domain/types.ts`
- `src/lib/demo-data/employees.ts`
- `src/lib/demo-data/payroll-run.ts`
- `src/lib/demo-data/anomalies.ts`
- `src/lib/demo-data/checklist.ts`
- `src/lib/demo-data/audit.ts`
- `src/lib/demo-data/index.ts`
- `src/lib/domain/selectors.ts`

#### Exact TypeScript types
Create these exact types:

```ts
type Severity = "critical" | "warning" | "info";
type AnomalyStatus = "open" | "reviewed" | "waiting_for_customer" | "ignored" | "message_drafted" | "message_sent";

type EmployeeRecord = {
  id: string;
  fullName: string;
  roleTitle: string;
  employmentType: "monthly" | "hourly";
  team: string;
};

type PayrollAnomaly = {
  id: string;
  employeeId: string;
  severity: Severity;
  type:
    | "missing_tax_card"
    | "net_salary_change"
    | "final_salary_checklist_incomplete"
    | "missing_working_hours"
    | "tulorekisteri_validation"
    | "missing_lunch_benefit"
    | "absence_affects_salary";
  title: string;
  explanation: string;
  evidence: string;
  suggestedNextAction: string;
  status: AnomalyStatus;
  previousMonthContext?: string;
  blockingApproval: boolean;
};

type AuditEventSeed = {
  id: string;
  at: string;
  actor: "system_ai";
  action: string;
  targetId?: string;
  detail: string;
};

type ChecklistItemKey =
  | "employee_data_checked"
  | "tax_card_data_checked"
  | "absences_checked"
  | "benefits_checked"
  | "final_salary_cases_checked"
  | "customer_missing_info_resolved"
  | "tulorekisteri_validation_checked"
  | "ready_for_approval";
```

#### Demo content requirements
- 18 employees with Finnish-style fake names
- 6 to 8 anomalies
- At least:
  - 1 critical
  - 3 warnings
  - 2 info
- Fake previous month comparison notes
- Fake customer/accounting context with no real identities

#### Exact user interactions
No new interactions in this step. This step enables later UI steps.

#### Acceptance criteria
- All demo-facing data comes from typed modules, not inline component constants
- Derived counts can be computed from selectors
- Demo data supports all requested UI features without additional shape changes

#### Manual test checklist
- Verify 18 unique employees exist
- Verify every anomaly links to a valid employee
- Verify summary selectors return counts expected by the dashboard
- Verify no obvious real personal data appears

#### Automated tests to add
- selector tests:
  - total employees
  - critical issue count
  - waiting for customer count
  - estimated time saved
- data integrity tests:
  - all anomaly employee IDs resolve
  - anomaly IDs are unique

#### Security details
- No real personal data
- No production-like identifiers such as real tax IDs or bank details

### Files likely to change
- `src/lib/domain/types.ts`
- `src/lib/demo-data/*`
- `src/lib/domain/selectors.ts`

### Tests/checks
- Selector unit tests
- Data integrity unit tests

### Suggested commit message
`feat(data): add typed demo payroll dataset and derived selectors`

---

## Step 4: AI anomaly review cards

### Goal
Build the main anomaly review queue with realistic payroll issue cards and first-pass actions.

### Implementation details

#### Exact key components to create
- `src/components/anomalies/anomaly-list.tsx`
- `src/components/anomalies/anomaly-card.tsx`
- `src/components/anomalies/severity-badge.tsx`
- `src/components/anomalies/anomaly-status-badge.tsx`
- `src/components/anomalies/anomaly-actions.tsx`

#### Exact utility/service modules to create
- `src/lib/review-state/types.ts`
- `src/lib/review-state/session-state.ts`
- `src/lib/review-state/reducers.ts`
- `src/lib/review-state/actions.ts`
- `src/lib/review-state/selectors.ts`

#### Exact state shape
Create session-scoped review state:

```ts
type DemoReviewState = {
  anomalyStates: Record<
    string,
    {
      status: AnomalyStatus;
      reviewedAt?: string;
      ignoredReason?: string;
      messageDraftId?: string;
      customerMessageSentAt?: string;
    }
  >;
  auditEvents: AuditEvent[];
};
```

Base approach:
- Static anomaly definitions from demo data
- Runtime state overrides stored in signed session token or server-side serialized session payload
- If cookie size becomes a concern, store only delta state, not full demo data

#### Exact user interactions
On each anomaly card:
- `Review details`
- `Mark as reviewed`
- `Ask customer`
- `Generate customer message`
- `Ignore with reason`

Behavior:
- `Mark as reviewed` changes status to `reviewed`
- `Ask customer` changes status to `waiting_for_customer`
- `Generate customer message` opens message flow in Step 6
- `Ignore with reason` opens reason capture UI in Step 5
- `Review details` opens detail panel in Step 5

#### State mutation approach
Preferred:
- Use authenticated POST server actions or route handlers
- Shared mutation functions validate session and anomaly ID
- Add `Origin` check for authenticated mutating requests starting in this step

#### Acceptance criteria
- Every anomaly card shows:
  - severity
  - employee name
  - title
  - explanation
  - evidence
  - suggested next action
- Action buttons are visible and state-aware
- Summary counts update after status changes
- Status change persists during the active session refresh

#### Manual test checklist
- Change one anomaly to reviewed and refresh page
- Change one anomaly to waiting for customer and refresh page
- Verify summary counts update immediately or after reload
- Verify buttons stay aligned on mobile
- Verify severity colors remain accessible

#### Automated tests to add
- `anomaly-card.test.tsx`
- `review-state-reducers.test.ts`
- server mutation tests:
  - reviewed action updates status
  - waiting_for_customer action updates status
  - invalid anomaly ID rejected
  - unauthenticated mutation rejected

#### Security details
- Validate anomaly ID server-side
- Never trust client-submitted status values directly
- Restrict allowed transitions in the mutation layer
- Check request origin for cookie-authenticated mutation endpoints

### Files likely to change
- `src/components/anomalies/*`
- `src/lib/review-state/*`
- `src/app/(protected)/page.tsx`
- `src/app/api/review/*` or server actions location

### Tests/checks
- UI render tests
- mutation tests
- manual persistence check across refresh

### Suggested commit message
`feat(anomalies): add anomaly review queue and session-backed state`

---

## Step 5: Anomaly detail view and human review actions

### Goal
Create a focused detail surface for reviewing one anomaly and capturing explicit human decisions.

### Implementation details

#### Exact key components to create
- `src/components/anomalies/anomaly-detail-drawer.tsx`
- `src/components/anomalies/anomaly-evidence-panel.tsx`
- `src/components/anomalies/ignore-reason-dialog.tsx`
- `src/components/anomalies/action-history-inline.tsx`

#### Exact utility/service modules to create
- `src/lib/audit/types.ts`
- `src/lib/audit/create-event.ts`
- `src/lib/audit/labels.ts`

#### Exact additional types
```ts
type IgnoreReasonCode =
  | "false_positive"
  | "already_resolved_outside_system"
  | "customer_confirmed_exception"
  | "not_relevant_for_this_run";
```

Optional payload:
```ts
type IgnoreDecisionInput = {
  anomalyId: string;
  reasonCode: IgnoreReasonCode;
  note?: string;
};
```

#### Exact user interactions
- Open detail drawer from `Review details`
- Read expanded explanation, evidence, previous month context, and recommended next step
- Mark reviewed
- Ignore with reason
- Close drawer and return to list
- View inline action history for the anomaly

#### Acceptance criteria
- Detail view shows full anomaly context
- Ignore action requires a selected reason
- All human decisions append audit events
- Drawer is keyboard accessible and closable via escape

#### Manual test checklist
- Open detail drawer on multiple anomalies
- Attempt ignore without selecting a reason and verify validation
- Ignore an anomaly and verify status badge changes
- Mark reviewed from drawer and verify audit event appears later
- Verify focus returns sensibly when drawer closes

#### Automated tests to add
- `anomaly-detail-drawer.test.tsx`
- `ignore-reason-dialog.test.tsx`
- audit event creation tests for:
  - anomaly opened
  - anomaly reviewed
  - anomaly ignored with reason

#### Security details
- Validate ignore reason against allowed enum server-side
- Sanitize optional free-text note before rendering if stored
- Keep note length bounded

### Files likely to change
- `src/components/anomalies/*`
- `src/lib/audit/*`
- `src/lib/review-state/*`

### Tests/checks
- validation tests
- focus/accessibility manual checks
- audit event tests

### Suggested commit message
`feat(review): add anomaly detail drawer and explicit decision logging`

---

## Step 6: Customer message drafting flow

### Goal
Allow payroll specialists to generate, review, copy, and send realistic Finnish customer messages for missing information.

### Implementation details

#### Exact key components to create
- `src/components/messages/message-draft-modal.tsx`
- `src/components/messages/message-draft-body.tsx`
- `src/components/messages/message-draft-actions.tsx`

#### Exact utility/service modules to create
- `src/lib/messages/types.ts`
- `src/lib/messages/generate-draft.ts`
- `src/lib/messages/tone-variants.ts`

#### Exact types
```ts
type MessageTone = "neutral" | "polite_urgent";

type CustomerMessageDraft = {
  id: string;
  anomalyId: string;
  employeeId: string;
  tone: MessageTone;
  subject?: string;
  body: string;
  language: "fi";
  generatedAt: string;
};
```

#### Exact user interactions
- Click `Generate customer message`
- Modal opens with Finnish draft
- User can:
  - copy message
  - regenerate / improve tone
  - mark as sent
  - close and return
- `Mark as sent` changes anomaly status to `message_sent` or `waiting_for_customer` depending on chosen state model
  - recommended: `waiting_for_customer` plus a separate sent timestamp
- Copy action shows lightweight confirmation

#### Acceptance criteria
- Finnish message reads professionally and specifically references the anomaly context
- Regenerate changes tone while keeping required facts
- Sent action updates anomaly state and audit trail
- Draft generation is deterministic for the same anomaly + tone combination unless explicitly variant-based

#### Manual test checklist
- Generate message for missing working hours anomaly
- Regenerate to improved tone and verify wording changes
- Copy message and verify confirmation appears
- Mark sent and verify anomaly status updates
- Verify non-messageable anomalies either hide or disable the action

#### Automated tests to add
- `generate-draft.test.ts`
- `message-draft-modal.test.tsx`
- audit tests for:
  - message generated
  - message tone regenerated
  - message marked sent

#### Security details
- Do not use clipboard APIs in a way that breaks secure contexts in production
- Validate anomaly type before generating a message
- No HTML rendering of message body; render as plain text

### Files likely to change
- `src/components/messages/*`
- `src/lib/messages/*`
- `src/lib/review-state/*`
- `src/lib/audit/*`

### Tests/checks
- draft generation tests
- modal interaction tests
- manual copy/send flow check

### Suggested commit message
`feat(messages): add Finnish customer message drafting and send flow`

---

## Step 7: AI assistant side panel with mock responses

### Goal
Add a deterministic, context-aware AI assistant panel that demonstrates LLM-ready UX without live model dependency.

### Implementation details

#### Exact key components to create
- `src/components/assistant/payroll-assistant-panel.tsx`
- `src/components/assistant/prompt-chip-list.tsx`
- `src/components/assistant/assistant-response-card.tsx`

#### Exact utility/service modules to create
- `src/lib/assistant/types.ts`
- `src/lib/assistant/prompts.ts`
- `src/lib/assistant/respond.ts`

#### Exact types
```ts
type AssistantPromptId =
  | "check_first"
  | "explain_anomaly"
  | "draft_customer_message"
  | "summarize_risks"
  | "approval_blockers";

type AssistantResponse = {
  promptId: AssistantPromptId;
  title: string;
  body: string;
  relatedAnomalyIds?: string[];
  generatedAt: string;
};
```

#### Exact user interactions
- Click prompt chip
- See loading state
- Receive deterministic response
- If relevant, response links back to anomaly IDs or checklist blockers

#### Acceptance criteria
- All five requested prompt chips exist
- Responses are specific to current demo state where relevant
- Assistant clearly appears as support, not autonomous decision-maker

#### Manual test checklist
- Click each chip and verify distinct response
- Change anomaly states and verify blocker summary changes
- Verify panel remains readable on narrower widths

#### Automated tests to add
- `assistant-respond.test.ts`
- `payroll-assistant-panel.test.tsx`

#### Security details
- No external LLM calls
- No prompt contents sent off-platform
- Assistant response generation uses only local deterministic logic

### Files likely to change
- `src/components/assistant/*`
- `src/lib/assistant/*`
- `src/app/(protected)/page.tsx`

### Tests/checks
- response mapping tests
- panel interaction tests

### Suggested commit message
`feat(assistant): add deterministic payroll assistant side panel`

---

## Step 8: Audit log

### Goal
Add a professional audit trail that reinforces trust, traceability, and human oversight.

### Implementation details

#### Exact key components to create
- `src/components/audit/audit-log.tsx`
- `src/components/audit/audit-event-row.tsx`
- `src/components/audit/audit-actor-badge.tsx`

#### Exact utility/service modules to create
- `src/lib/audit/format-event.ts`
- `src/lib/audit/append-event.ts`
- `src/lib/audit/selectors.ts`

#### Exact types
```ts
type AuditActor = "system_ai" | "human_reviewer";

type AuditEvent = {
  id: string;
  at: string;
  actor: AuditActor;
  action:
    | "anomaly_detected"
    | "anomaly_opened"
    | "message_generated"
    | "message_sent"
    | "anomaly_reviewed"
    | "anomaly_ignored"
    | "checklist_updated"
    | "payroll_ready_for_approval";
  targetId?: string;
  detail: string;
};
```

#### Exact user interactions
- User scrolls audit timeline
- User sees new events appear after state changes in prior steps

#### Acceptance criteria
- Audit log includes both seeded AI events and new human actions
- Entries display actor, timestamp, action label, and detail
- New actions appear in reverse chronological order

#### Manual test checklist
- Perform review and message actions, then confirm audit log updates
- Confirm seeded AI detection events appear first on a fresh session
- Verify labels are understandable to non-technical reviewers

#### Automated tests to add
- `append-event.test.ts`
- `format-event.test.ts`
- `audit-log.test.tsx`

#### Security details
- Audit entries are append-only within session
- Do not allow client to submit arbitrary actor type
- Human actor must always be derived from authenticated session context

### Files likely to change
- `src/components/audit/*`
- `src/lib/audit/*`
- `src/lib/review-state/*`

### Tests/checks
- event append tests
- timeline render tests
- manual ordering check

### Suggested commit message
`feat(audit): add append-only payroll review audit timeline`

---

## Step 9: Payroll readiness checklist

### Goal
Show whether payroll is ready for approval and what still blocks completion.

### Implementation details

#### Exact key components to create
- `src/components/checklist/payroll-readiness-checklist.tsx`
- `src/components/checklist/checklist-item-row.tsx`
- `src/components/checklist/approval-status-card.tsx`

#### Exact utility/service modules to create
- `src/lib/checklist/derive-checklist.ts`
- `src/lib/checklist/types.ts`

#### Exact types
```ts
type ChecklistItemStatus = "complete" | "incomplete" | "blocked";

type ChecklistItem = {
  key: ChecklistItemKey;
  label: string;
  status: ChecklistItemStatus;
  detail?: string;
};
```

#### Exact user interactions
- User views checklist
- Checklist reflects current anomaly and message statuses
- When blockers clear, `Ready for approval` becomes complete

#### Acceptance criteria
- All required checklist items appear
- Blocked state explains why approval is not ready
- Ready-for-approval remains incomplete while critical blockers remain

#### Manual test checklist
- Resolve a non-blocking anomaly and verify checklist updates appropriately
- Mark customer-contacted anomalies sent and verify customer-input item changes
- Verify ready-for-approval does not turn complete too early

#### Automated tests to add
- `derive-checklist.test.ts`
- `payroll-readiness-checklist.test.tsx`

#### Security details
- Checklist status is derived server-side from trusted review state, not client hints

### Files likely to change
- `src/components/checklist/*`
- `src/lib/checklist/*`
- `src/app/(protected)/page.tsx`

### Tests/checks
- derivation tests
- UI render tests
- blocker manual validation

### Suggested commit message
`feat(checklist): add payroll readiness logic and approval blockers`

---

## Step 10: Polish, responsive design, accessibility, and empty/error states

### Goal
Make the prototype feel reviewer-ready, intentional, and production-minded.

### Implementation details

#### Exact key components / files to refine
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/loading-skeleton.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/globals.css` or `src/styles/globals.css`

#### Exact UI requirements
- Calm enterprise palette
- Strong spacing consistency
- Accessible contrast
- Clear visual distinction for `critical`, `warning`, `info`
- Professional empty states for:
  - no anomalies reviewed yet
  - all anomalies resolved
- Loading states for assistant and message generation
- Graceful route-level error handling

#### Exact user interactions
- Resize viewport
- Navigate full dashboard
- Trigger loading and error states where possible

#### Acceptance criteria
- UI feels cohesive and non-placeholder
- Mobile layout remains functional
- Keyboard focus states are visible
- Empty/error/loading states feel productized, not generic browser fallback

#### Manual test checklist
- Review app at mobile, tablet, laptop widths
- Tab through all buttons and links
- Confirm color contrast is reasonable
- Verify assistant loading state
- Verify empty state when anomalies list is filtered or resolved

#### Automated tests to add
- basic tests for error/empty components
- accessibility-oriented render tests for labels and button names

#### Security details
- Error pages must not expose stack traces or secrets in production-facing UI

### Files likely to change
- `src/components/ui/*`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- global styles
- feature components for visual cleanup

### Tests/checks
- manual responsive pass
- basic UI state tests
- accessibility spot checks

### Suggested commit message
`feat(ui): polish product experience responsive layout and accessibility`

---

## Step 11: Tests

### Goal
Add a compact but meaningful test suite that proves engineering quality without overbuilding.

### Implementation details

#### Exact test areas
- auth token validation
- session route protection
- anomaly state transitions
- ignore reason validation
- customer message generation
- assistant prompt mapping
- audit event append behavior
- checklist derivation
- key dashboard render paths

#### Exact test files to ensure exist
- `src/lib/auth/invite-token.test.ts`
- `src/lib/auth/session-token.test.ts`
- `src/lib/review-state/reducers.test.ts`
- `src/lib/messages/generate-draft.test.ts`
- `src/lib/assistant/respond.test.ts`
- `src/lib/audit/append-event.test.ts`
- `src/lib/checklist/derive-checklist.test.ts`
- selected component tests under `src/components/**/__tests__` or adjacent `.test.tsx`

#### Acceptance criteria
- Test suite passes locally
- Tests cover the main security and workflow claims made in the README
- No excessive snapshot dependence

#### Manual test checklist
- Run full test command from clean install
- Verify no test requires network access
- Verify no test depends on real secrets beyond test fixtures

#### Automated tests to add
This step is the automated test consolidation step itself.

Suggested scripts:
- `npm test`
- `npm run test:watch`
- optional `npm run test:e2e`

#### Security details
- Use isolated fake secrets in test fixtures
- Never commit real invite tokens into test files

### Files likely to change
- `package.json`
- `vitest.config.ts`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- optional `playwright.config.ts`

### Tests/checks
- run unit/component suite
- optional single browser smoke test

### Suggested commit message
`test: add focused coverage for auth review workflow and audit logic`

---

## Step 12: README, deployment instructions, and private demo instructions

### Goal
Produce professional documentation suitable for a job application link and reviewer handoff.

### Implementation details

#### Exact docs to create or update
- `README.md`
- optional `docs/demo-access.md` only if README becomes too long

#### README sections to include
- What the demo is
- Why it was built
- Target user
- Product problem
- Product design rationale
- Human-in-the-loop principle
- Security and authentication model
- Tech stack
- Local setup
- Environment variables
- How to generate a demo invite link
- How to send the private demo link
- Deployment on Vercel
- What is mocked
- What is production-ready in principle
- What I would improve next
- Testing
- In the end of the file a string "This is an independent portfolio prototype. It is not affiliated with, endorsed by, or connected to any real payroll, accounting, or financial software provider. All data is synthetic and used only for demonstration purposes."

#### Exact private demo instructions to include
- Set production env vars
- Deploy app
- Run invite generation script with reviewer label
- Copy generated URL
- Paste into email
- Mention expiry window
- Regenerate if needed

#### Acceptance criteria
- README is understandable to both engineering and hiring audiences
- A reviewer can deploy and create a safe invite link without asking follow-up questions
- Documentation clearly distinguishes prototype scope vs production implications

#### Manual test checklist
- Follow README from a clean checkout
- Verify setup and invite generation commands are correct
- Verify env var names match implementation exactly

#### Automated tests to add
No new code tests required, but run the existing suite after documentation updates.

#### Security details
- README must explain that invite links are signed and expiring
- README must not recommend public shared passwords or permanent admin URLs

### Files likely to change
- `README.md`
- optional docs files
- `.env.example`

### Tests/checks
- documentation walkthrough from clean environment
- verify commands and env names

### Suggested commit message
`docs: add product rationale deployment guide and private demo workflow`

---

## Assumptions and defaults

- The repo is greenfield and can be scaffolded around `Next.js`
- No database will be introduced for v1 demo
- Session state is reviewer-session scoped and disposable
- No live email delivery will be implemented
- No live LLM integration will be implemented
- Protected mutations from Step 4 onward should include origin validation because the app will rely on cookie-authenticated requests
- The first implementation pass should prefer maintainability and clarity over advanced abstraction
