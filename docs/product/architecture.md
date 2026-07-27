# Product Decision and Architecture

## Decision

Build a static local browser app instead of a review portal, extension, desktop bundle, or AI
assistant.

The observed pain begins after feedback has already escaped a preferred review system. Requiring a
new account or client workflow would repeat the adoption failure described in the evidence. A
paste-first local surface meets the editor where the cleanup work already happens.

## Primary outcome

One sorted, source-preserving revision checklist.

## Three actions and three steps

Actions: load sample, normalize notes, export checklist.
Happy path: paste, normalize, export.

Checkboxes are review affordances, not a separate product workflow. Theme selection is a display
preference.

## Components

- `src/parser.js`: deterministic parsing and exports; no DOM or network access.
- `src/app.js`: browser state, safe DOM rendering, clipboard, and local CSV download.
- `index.html` and `styles.css`: semantic responsive interface and light/dark tokens.
- `scripts/serve.mjs`: loopback-only static development server.
- `scripts/audit.mjs`: bounded format, lint, secret-pattern, and license checks.
- `tests/`: Node core-transformation tests.
- `playwright/`: E2E, recovery, theme, accessibility, and viewport proof.

## Data integrity

The parser does not infer intent:

- invalid frame values are not accepted as framed timecodes;
- untimed notes remain untimed;
- multiple notes at one moment remain separate;
- exact repeats are flagged, not deleted; and
- reviewer/source text is preserved when present and labeled unspecified when absent.

## Known limitations

- Natural-language time references such as “near the outro” remain untimed.
- Similar-but-not-identical notes are grouped only by exact timeline moment, not semantic meaning.
- Drop-frame timecode math is not implemented.
- Voice notes, screenshots, PDFs, portal APIs, and NLE marker formats are not inputs.
