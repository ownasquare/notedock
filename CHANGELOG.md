# Changelog

All notable changes are documented here.

## [Unreleased]

### Changed

- Preserve malformed frame timecodes as explicitly untimed notes with a visible validation issue.
- Neutralize formula-leading cells in CSV exports.
- Recover from clipboard permission denial with a visible CSV fallback.
- Refresh the full release validation and responsive light/dark proof matrix.

## [0.1.0] - 2026-07-27

### Added

- Local paste-and-normalize workflow for mixed-channel revision notes.
- MM:SS, HH:MM:SS, and HH:MM:SS:FF parsing.
- Source and reviewer headers, chronological sorting, untimed-note preservation, same-moment
  grouping, and exact-repeat flags.
- Markdown copy and CSV download.
- Responsive light/dark interface with keyboard and accessibility coverage.
- Focused parser tests, Playwright E2E, dependency/license/secret audits, and package smoke checks.
