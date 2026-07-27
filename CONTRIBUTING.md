# Contributing

NoteDock welcomes small, evidence-backed improvements that preserve its one-job workflow.

## Before changing code

1. Open an issue or local decision note describing the editor workflow and concrete failure.
2. Keep the happy path at paste → normalize → export.
3. Do not add media hosting, generic chat, analytics, accounts, provider calls, or client contact.
4. Add a focused unit or Playwright test for the changed behavior.

## Local workflow

```bash
npm install
npm test
npm run format:check
npm run lint
npm run typecheck
npm run audit:secrets
npm run audit:license
npm run test:e2e
```

Playwright is the only E2E harness. Do not add Cypress E2E.

## Pull-request expectations

- Explain the user-visible outcome.
- Keep fixtures synthetic and non-sensitive.
- Include validation commands and results.
- Update `CHANGELOG.md` and the nearest product documentation.
- Preserve keyboard, mobile, tablet, desktop, light, and dark behavior.
