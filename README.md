# NoteDock

Turn scattered video revision notes into one sorted, source-preserving edit checklist.

NoteDock is a local browser app for freelance video editors and small post-production teams whose
clients send feedback through email, chat, documents, and review tools. It parses pasted
timecodes, keeps source and reviewer labels, groups notes at the same moment, flags exact repeats,
and exports Markdown or CSV.

**Proof status:** local open-source experiment. There is no hosted, production, provider,
publication, payment, buyer, usage, or demand proof.

## Use it in three steps

1. Paste one note per line. Add optional headers such as `[Email | Maya]`.
2. Select **Normalize notes**.
3. Review the ordered list, then copy Markdown or download CSV.

Supported timecodes are `MM:SS`, `HH:MM:SS`, and `HH:MM:SS:FF`. Untimed notes are preserved at
the end instead of being assigned an invented position.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4175](http://127.0.0.1:4175).

## Validate

```bash
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

Playwright owns all end-to-end tests. This is not a React project and does not use Cypress.

## Product boundary

NoteDock:

- processes pasted text in browser memory;
- never uploads notes;
- uses deterministic parsing, not AI inference;
- keeps ambiguous same-moment notes visible; and
- exports a checklist without changing media or contacting anyone.

NoteDock does not host media, transcribe calls or voice notes, infer creative intent, approve a
cut, synchronize with an NLE, or replace Frame.io, Vimeo Review, or Filestage.

## Input example

```text
[Email | Maya]
00:18 Logo should enter after the first sentence
No timecode: Verify the legal spelling

[Slack | Jordan]
At 01:07 Tighten the pause
```

## Data and privacy

There is no backend, account, telemetry, analytics, cookie, or network request in the core app.
Refreshing the tab clears the active checklist. Exports are created locally through browser APIs.
See [SECURITY.md](SECURITY.md) for the trust boundary.

## Documentation

- [Product decision and architecture](docs/product/architecture.md)
- [Monetization hypothesis](docs/product/monetization-hypothesis.md)
- [Completion record](docs/notedock/2026-07-27-completion.md)
- [Continuation handoff](docs/handoffs/2026-07-27-codex-notedock.handoff.mdc)

## License

MIT. See [LICENSE](LICENSE).
