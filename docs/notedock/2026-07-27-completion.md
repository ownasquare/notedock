# NoteDock Completion Record — 2026-07-27

## Outcome

NoteDock is a locally usable, MIT-licensed experiment that turns pasted video-revision feedback
into one chronological, source-preserving checklist. It supports `MM:SS`, `HH:MM:SS`, and
`HH:MM:SS:FF`; preserves untimed notes; groups notes at the same moment; flags exact repeats; and
exports Markdown or CSV.

The scope stayed within one outcome, three core actions, and three happy-path steps:

1. Paste or load a revision round.
2. Normalize the notes.
3. Copy Markdown or download CSV.

## Qualification and uniqueness

- Claim ID: `20260727T064333-0700-lane05-notedock`
- Pain score: `33/35`
- Real-pain signal: `7/7`
- Idea-filter score: `32/35`
- Hard floors: severity `4/5`, demoability `5/5`, speed `5/5`
- Weighted score: `4.50/5.00`
- Niche score: `70/75`
- Evidence: eight public pain/workaround discussions across three independently operated
  communities.

The complete evidence scan, ten-candidate screen, scoring calculations, and portfolio comparison
are in
`/Users/fortunevieyra/Documents/Github/ai-projects/docs/1000-apps-100-days/runs/2026-07-27-lane-05-creator-production.md`.

## Architecture and data integrity

- `src/parser.js`: deterministic parsing, sorting, grouping, repeat detection, and exports.
- `src/app.js`: DOM controller and local browser actions.
- `scripts/serve.mjs`: dependency-free local static server.
- `scripts/audit.mjs`: repository-specific format, lint, secret, and license checks.
- `tests/parser.test.js`: focused parser and export tests.
- `playwright/notedock.spec.js`: real local happy path, failure recovery, export, keyboard, landmark,
  and theme proof.
- `playwright/proof.spec.js`: desktop, tablet, and mobile light/dark screenshot proof.

There is no backend, account, telemetry, analytics, cookie, provider, or AI inference. Input stays
in the active browser tab. Tests use synthetic revision notes only.

## Continuation hardening

The publication continuation reconciled the initial commit and then made three bounded reliability
changes without expanding the product:

- malformed frame timecodes are stripped from note text, preserved as untimed, and reported;
- formula-leading CSV cells are apostrophe-prefixed before spreadsheet use; and
- clipboard denial produces a visible recovery message while leaving CSV download available.

The focused regression proof passed 8 unit tests and 18 workflow-only Playwright cases. The full
matrix passed 21 Playwright cases across desktop, tablet, and mobile.

## Validation

The final commit is created only after these commands pass:

```text
npm ci --ignore-scripts
npm test
npm run format:check
npm run lint
npm run typecheck
npm run audit:secrets
npm run audit:license
npm audit --audit-level=high
npm run test:e2e
npm run package:smoke
```

Playwright owns E2E. NoteDock is not React and has no Cypress dependency. Durable visual evidence
is stored in `proof/screenshots/` for desktop, tablet, and mobile in both light and dark mode.

## Proof boundaries

- Local proof: required and recorded through tests, E2E, package smoke, and screenshot review.
- Hosted-dev proof: not attempted; no deployment authority.
- Production proof: not attempted; no production authority.
- Provider/dashboard proof: not applicable; no provider integration.
- Publication proof: pending account-scoped GitHub publisher and remote SHA readback.
- Payment proof: not attempted; no live payments.
- Demand proof: public pain/workaround evidence only. There is no buyer, usage, payment, or market
  proof.
- Monetization: hypothesis only; see `docs/product/monetization-hypothesis.md`.

## Commit and release boundary

The validated hardening changes will be committed on local branch `main` before publication.
GitHub repository creation and push are authorized only for the reserved
`ownasquare/notedock` target through the account-scoped publisher. Hosted deployment, provider
actions, payments, user contact, and other publication surfaces remain unauthorized.

## Warning triage

- Missing Playwright browser: `fixed_now` by installing local Chromium.
- Theme-state locator mismatch: `fixed_now`.
- Hidden-state CSS overridden by card layout: `fixed_now`.
- Skip-link visible in proof screenshot: `fixed_now`.
- Mobile textarea loaded below the first line: `fixed_now`.
- Audit scanner matching its own declarations: `fixed_now`.
- Port `4173` occupied by another local app: `fixed_now` by assigning NoteDock the collision-free
  default `4175` without terminating the unrelated process.
- Initial export assertion omitted Markdown emphasis delimiters: `fixed_now` after clipboard
  readback exposed the exact generated format.
- Malformed frame timecodes lacked a precise recovery issue: `fixed_now`.
- CSV spreadsheet-formula interpretation risk: `fixed_now`.
- Clipboard permission denial was unhandled: `fixed_now`.
- Remaining known warning: none.
- Warning suppression: `not_suppressed`.
