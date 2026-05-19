# Payroll Review Copilot

A small Next.js app that demonstrates payroll anomaly review flows, demo auth, and automated tests.

## Quick Start

- **Prerequisites:** Node.js 18+ and npm (or compatible package manager).
- **Install:**

```bash
npm install
```

- **Run (development):**

```bash
npm run dev
```

- **Build & Start (production):**

```bash
npm run build
npm run start
```

## Useful Scripts

- **`npm run dev`**: Start the Next.js dev server.
- **`npm run build`**: Build the production app.
- **`npm run start`**: Start the production server (after `build`).
- **`npm run generate:demo-invite`**: Run the demo invite generator script (scripts/generate-demo-invite.ts).
- **`npm test`**: Run unit tests with Vitest.
- **`npm run test:e2e`**: Run end-to-end tests with Playwright.

## Testing

- Unit tests: Vitest is configured — run `npm test` to execute all tests under the codebase (see `src/**/__tests__`).
- E2E tests: Playwright tests live under `tests/e2e/`. Use `npm run test:e2e` to run the suite. Playwright may need browsers installed on first run; the Playwright runner will prompt or install as needed.

## Project Structure (high level)

- `src/app/` — Next.js app routes and pages.
- `src/components/` — UI components and their tests.
- `src/lib/` — Utilities, demo data, auth helpers, and application logic.
- `tests/` — end-to-end Playwright tests.

## Environment & Secrets

This repository is configured for local development and demo usage. Do not commit secrets or production credentials. If you need to supply environment variables, create a `.env.local` file and add variables there; ensure `.gitignore` contains `.env.local` in your environment.

## Development Notes

- The app is built with Next.js (app directory), TypeScript, TailwindCSS, Vitest, and Playwright.
- If you add new tests, prefer colocating unit tests alongside components in `__tests__` directories.
- Run `npm run generate:demo-invite` to produce demo invites used by the demo-auth flows.

## Troubleshooting

- Missing types or build failure: run `npm install` and ensure your Node.js version matches the engine used locally.
- Playwright/browser issues: run `npx playwright install` to install browsers.