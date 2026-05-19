# Payroll Review Copilot

Payroll Review Copilot is a Next.js demo for reviewing payroll anomalies with a human-in-the-loop workflow, signed demo invites, and synthetic data.

## What This Demo Is

This prototype shows how a reviewer can inspect payroll exceptions, review supporting context, draft customer follow-up messages, track audit history, and assess whether a payroll run is ready for approval.

## Main Demo Flows

- Open a signed demo invite and enter the app.
- Review synthetic payroll anomalies and supporting context.
- Use the checklist and review UI to make a decision.
- Run the automated test suite to verify core flows.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Playwright
- `jose` for signed invite/session handling

## Local Setup

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run start
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `DEMO_INVITE_SECRET`
- `DEMO_SESSION_SECRET`
- `DEMO_BASE_URL`
- `DEMO_INVITE_MAX_AGE_HOURS`
- `DEMO_SESSION_MAX_AGE_HOURS`

## Private Demo Invite Link

Use `npm run generate:demo-invite` to create a signed invite link for private sharing. Invite links are signed and expiring, so there is no need for shared passwords or a permanent public admin URL.

## Testing

- `npm test` for unit tests
- `npm run test:e2e` for Playwright end-to-end tests

## Security / Data Note

All data in this demo is synthetic. Keep invite and session secrets out of source control, and share access only through signed invite links that expire.

See [docs/demo-handoff.md](docs/demo-handoff.md) for the longer demo handoff notes.

This is an independent portfolio prototype. It is not affiliated with, endorsed by, or connected to any real payroll, accounting, or financial software provider. All data is synthetic and used only for demonstration purposes.
