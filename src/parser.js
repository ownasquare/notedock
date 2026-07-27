/**
 * @typedef {Object} RevisionNote
 * @property {number} id
 * @property {string} text
 * @property {string} source
 * @property {string} reviewer
 * @property {string | null} timecode
 * @property {number | null} seconds
 * @property {number | null} frames
 * @property {boolean} duplicate
 * @property {number} stackSize
 * @property {number} inputLine
 */

/**
 * @typedef {Object} ParseResult
 * @property {RevisionNote[]} notes
 * @property {string[]} issues
 * @property {{total: number, timed: number, untimed: number, duplicates: number, stacked: number}} stats
 */

const HEADER_PATTERN = /^\[\s*([^|\]]+?)(?:\s*\|\s*([^\]]+?))?\s*\]$/;
const FOUR_PART = /(?<!\d)(\d{1,2}):([0-5]\d):([0-5]\d):(\d{2})(?!\d)/;
const THREE_PART = /(?<!\d)(\d{1,2}):([0-5]\d):([0-5]\d)(?![:\d])/;
const TWO_PART = /(?<!\d)(\d{1,3}):([0-5]\d)(?![:\d])/;

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * @param {string} input
 * @param {number} frameRate
 * @returns {{raw: string, seconds: number, frames: number} | null}
 */
export function extractTimecode(input, frameRate) {
  const four = input.match(FOUR_PART);
  if (four) {
    const frames = Number(four[4]);
    if (frames >= frameRate) return null;
    return {
      raw: four[0],
      seconds: Number(four[1]) * 3600 + Number(four[2]) * 60 + Number(four[3]),
      frames,
    };
  }

  const three = input.match(THREE_PART);
  if (three) {
    return {
      raw: three[0],
      seconds: Number(three[1]) * 3600 + Number(three[2]) * 60 + Number(three[3]),
      frames: 0,
    };
  }

  const two = input.match(TWO_PART);
  if (!two) return null;
  return {
    raw: two[0],
    seconds: Number(two[1]) * 60 + Number(two[2]),
    frames: 0,
  };
}

/**
 * @param {number} seconds
 * @param {number} frames
 * @returns {string}
 */
export function formatTimecode(seconds, frames = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const base = [hours, minutes, remainingSeconds].map((part) => String(part).padStart(2, "0")).join(":");
  return frames > 0 ? `${base}:${String(frames).padStart(2, "0")}` : base;
}

/**
 * @param {string} input
 * @param {number} frameRate
 * @returns {ParseResult}
 */
export function parseRevisionNotes(input, frameRate = 24) {
  const lines = input.split(/\r?\n/);
  /** @type {RevisionNote[]} */
  const notes = [];
  /** @type {string[]} */
  const issues = [];
  let source = "Pasted notes";
  let reviewer = "Unspecified reviewer";

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;

    const header = line.match(HEADER_PATTERN);
    if (header) {
      source = header[1].trim();
      reviewer = header[2]?.trim() || "Unspecified reviewer";
      return;
    }

    const cleanedBullet = line.replace(/^[-*•]\s*/, "");
    const fourPartCandidate = cleanedBullet.match(FOUR_PART);
    const time = extractTimecode(cleanedBullet, frameRate);
    const invalidFrameTimecode = fourPartCandidate && !time ? fourPartCandidate : null;
    if (invalidFrameTimecode) {
      issues.push(
        `Line ${index + 1} uses frame ${Number(invalidFrameTimecode[4])} outside ${frameRate} fps; the note was preserved as untimed.`,
      );
    }
    let withoutTime = time
      ? cleanedBullet.replace(time.raw, " ")
      : invalidFrameTimecode
        ? cleanedBullet.replace(invalidFrameTimecode[0], " ")
        : cleanedBullet;
    withoutTime = withoutTime
      .replace(/^\s*(?:at|@)\s+/i, "")
      .replace(/^[\s—–:|-]+|[\s—–|]+$/g, "")
      .trim();

    let noteReviewer = reviewer;
    const reviewerPrefix = withoutTime.match(/^([A-Za-z][\w .'-]{1,40}):\s+(.+)$/);
    if (reviewerPrefix) {
      noteReviewer = reviewerPrefix[1].trim();
      withoutTime = reviewerPrefix[2].trim();
    }

    if (!withoutTime) {
      issues.push(`Line ${index + 1} contains a timecode but no revision text.`);
      return;
    }

    notes.push({
      id: notes.length + 1,
      text: withoutTime,
      source,
      reviewer: noteReviewer,
      timecode: time ? formatTimecode(time.seconds, time.frames) : null,
      seconds: time?.seconds ?? null,
      frames: time?.frames ?? null,
      duplicate: false,
      stackSize: 1,
      inputLine: index + 1,
    });
  });

  notes.sort((a, b) => {
    if (a.seconds === null && b.seconds === null) return a.inputLine - b.inputLine;
    if (a.seconds === null) return 1;
    if (b.seconds === null) return -1;
    return a.seconds - b.seconds || (a.frames ?? 0) - (b.frames ?? 0) || a.inputLine - b.inputLine;
  });

  const firstByFingerprint = new Map();
  const momentCounts = new Map();
  notes.forEach((note) => {
    const moment = note.seconds === null ? null : `${note.seconds}:${note.frames ?? 0}`;
    if (moment) momentCounts.set(moment, (momentCounts.get(moment) ?? 0) + 1);
    const fingerprint = `${moment ?? "untimed"}:${normalizeText(note.text)}`;
    if (firstByFingerprint.has(fingerprint)) note.duplicate = true;
    else firstByFingerprint.set(fingerprint, note.id);
  });

  notes.forEach((note) => {
    if (note.seconds === null) return;
    note.stackSize = momentCounts.get(`${note.seconds}:${note.frames ?? 0}`) ?? 1;
  });

  const stats = {
    total: notes.length,
    timed: notes.filter((note) => note.seconds !== null).length,
    untimed: notes.filter((note) => note.seconds === null).length,
    duplicates: notes.filter((note) => note.duplicate).length,
    stacked: [...momentCounts.values()].filter((count) => count > 1).length,
  };

  if (stats.untimed > 0) {
    issues.push(`${stats.untimed} note${stats.untimed === 1 ? "" : "s"} need timeline placement.`);
  }
  if (stats.stacked > 0) {
    issues.push(`${stats.stacked} timeline moment${stats.stacked === 1 ? "" : "s"} contain multiple notes to review together.`);
  }

  return { notes, issues, stats };
}

/**
 * @param {string} projectName
 * @param {RevisionNote[]} notes
 * @returns {string}
 */
export function toMarkdown(projectName, notes) {
  const title = projectName.trim() || "Revision checklist";
  const rows = notes.map((note) => {
    const time = note.timecode ?? "Needs placement";
    const flags = [note.duplicate ? "duplicate" : "", note.stackSize > 1 ? "same-moment group" : ""]
      .filter(Boolean)
      .join(", ");
    const suffix = flags ? ` _(${flags})_` : "";
    return `- [ ] **${time}** — ${note.text} — ${note.reviewer} · ${note.source}${suffix}`;
  });
  return [`# ${title}`, "", ...rows, "", "_Generated locally with NoteDock._"].join("\n");
}

/**
 * @param {RevisionNote[]} notes
 * @returns {string}
 */
export function toCsv(notes) {
  /** @param {unknown} value */
  const escape = (value) => {
    const text = String(value);
    const spreadsheetSafe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${spreadsheetSafe.replaceAll('"', '""')}"`;
  };
  const header = ["timecode", "note", "reviewer", "source", "duplicate", "same_moment_count"];
  const rows = notes.map((note) => [
    note.timecode ?? "",
    note.text,
    note.reviewer,
    note.source,
    note.duplicate,
    note.stackSize,
  ]);
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
