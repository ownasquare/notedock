import test from "node:test";
import assert from "node:assert/strict";
import { extractTimecode, formatTimecode, parseRevisionNotes, toCsv, toMarkdown } from "../src/parser.js";

test("extracts supported timecode shapes", () => {
  assert.deepEqual(extractTimecode("At 01:07 change it", 24), {
    raw: "01:07",
    seconds: 67,
    frames: 0,
  });
  assert.deepEqual(extractTimecode("00:01:07 tighten", 24), {
    raw: "00:01:07",
    seconds: 67,
    frames: 0,
  });
  assert.deepEqual(extractTimecode("01:02:03:12 cue", 24), {
    raw: "01:02:03:12",
    seconds: 3723,
    frames: 12,
  });
  assert.equal(extractTimecode("00:00:10:24 invalid", 24), null);
});

test("formats normalized timecodes", () => {
  assert.equal(formatTimecode(67), "00:01:07");
  assert.equal(formatTimecode(3723, 12), "01:02:03:12");
});

test("sorts notes and preserves source and reviewer context", () => {
  const result = parseRevisionNotes(`[Email | Maya]
01:07 Tighten this
00:18 Logo later
[Slack | Jordan]
No timestamp: Check legal spelling`, 24);
  assert.equal(result.notes.length, 3);
  assert.equal(result.notes[0].timecode, "00:00:18");
  assert.equal(result.notes[0].source, "Email");
  assert.equal(result.notes[0].reviewer, "Maya");
  assert.equal(result.notes[2].timecode, null);
  assert.equal(result.stats.untimed, 1);
});

test("flags exact repeats and same-moment groups without deleting either note", () => {
  const result = parseRevisionNotes(`[Email | Maya]
00:18 Logo later
[Slack | Jordan]
00:18 Logo later
00:18 Logo smaller`, 24);
  assert.equal(result.stats.total, 3);
  assert.equal(result.stats.duplicates, 1);
  assert.equal(result.stats.stacked, 1);
  assert.equal(result.notes.every((note) => note.stackSize === 3), true);
});

test("exports reviewable Markdown and escaped CSV", () => {
  const result = parseRevisionNotes(`[Email | Maya]
00:18 Make "logo" smaller`, 24);
  assert.match(toMarkdown("Launch film", result.notes), /# Launch film/);
  assert.match(toMarkdown("Launch film", result.notes), /00:00:18/);
  assert.match(toCsv(result.notes), /"Make ""logo"" smaller"/);
});

test("reports empty timecode-only lines instead of inventing a note", () => {
  const result = parseRevisionNotes("00:18", 24);
  assert.equal(result.notes.length, 0);
  assert.match(result.issues[0], /no revision text/);
});

test("preserves invalid frame timecodes as explicitly untimed notes", () => {
  const result = parseRevisionNotes("00:00:10:24 Replace the end card", 24);
  assert.equal(result.notes.length, 1);
  assert.equal(result.notes[0].timecode, null);
  assert.equal(result.notes[0].text, "Replace the end card");
  assert.match(result.issues[0], /frame 24 outside 24 fps/);
});

test("neutralizes spreadsheet formulas in CSV exports", () => {
  const result = parseRevisionNotes(`[Email | Maya]
00:18 =HYPERLINK("https://example.invalid","review")`, 24);
  assert.match(toCsv(result.notes), /"'=HYPERLINK\(""https:\/\/example\.invalid"",""review""\)"/);
});
