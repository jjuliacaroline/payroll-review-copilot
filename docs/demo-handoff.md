# Demo Handoff

## Target User And Product Problem

This demo is for a reviewer who needs to inspect payroll exceptions quickly without losing context. The product problem is the handoff between automated detection and final human judgment: the system surfaces suspicious or unusual items, but a person still needs to review the case, validate the evidence, and decide what happens next.

## Human-In-The-Loop Review Approach

The workflow is intentionally review-first. Automation narrows the queue and prepares context, but the final action stays with the human reviewer. The demo should make that loop obvious:

- identify the anomaly
- inspect supporting detail
- draft customer follow-up when information is missing
- track reviewer actions in the audit log
- use the readiness checklist before approval
- make a decision or escalate

This keeps the prototype focused on trust, traceability, and decision support instead of pretending the system can fully automate payroll review.

## Authentication Model

Access is based on signed, expiring invite links. A user opens a private invite, the app verifies the signature and age of the token, and then issues a short-lived session. Secrets for signing invites and sessions live in environment variables and should not be committed.

Do not use shared passwords or a permanent public admin URL.

## Deployment Notes

The app can be tested locally with the standard Next.js commands. For a hosted private demo, deploy it to a platform that supports Next.js server routes, cookies, and environment variables, such as Vercel.

Set these environment variables in the hosting provider before sharing demo links:

- `DEMO_INVITE_SECRET`
- `DEMO_SESSION_SECRET`
- `DEMO_BASE_URL`
- `DEMO_INVITE_MAX_AGE_HOURS`
- `DEMO_SESSION_MAX_AGE_HOURS`

Use the deployed app URL as `DEMO_BASE_URL`, for example `https://your-app.vercel.app`.

After deployment, generate a private invite link with the same `DEMO_INVITE_SECRET` and `DEMO_BASE_URL` values used by the deployed app:

```bash
npm run generate:demo-invite -- --reviewer "Demo Reviewer"
```

## Private Demo Sharing Steps

1. Deploy the app with the production secrets set.
2. Generate a signed invite link with the demo invite script.
3. Send only that link to the reviewer.
4. Confirm the link expires as expected.
5. Regenerate a new invite when the previous one expires or should no longer be used.


Invite links are signed and expiring, so they are safer to share than static URLs or shared passwords.

## What Is Mocked Or Synthetic

This demo uses synthetic payroll scenarios, synthetic identities, and synthetic review outcomes. Any displayed worker names, amounts, anomalies, or case notes are invented for demonstration only. There is no connection to real payroll systems or real employee records.

For local setup, scripts, and test commands, see the README.
