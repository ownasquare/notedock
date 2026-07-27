import { parseRevisionNotes, toCsv, toMarkdown } from "./parser.js";

const sample = `[Email | Maya]
00:18 Logo should enter after the first sentence
01:07 Tighten the pause before the product reveal
No timecode: Please verify the legal spelling on the end card

[Slack | Jordan]
At 00:18 Logo should enter after the first sentence
00:18 Keep the logo small enough to leave room for captions
01:42:12 Cut the room tone before the final line

[Review export | Sam]
00:01:07 The pause feels long here
02:11 Music can come down by two or three dB`;

const form = /** @type {HTMLFormElement} */ (document.querySelector("#notes-form"));
const sampleButton = /** @type {HTMLButtonElement} */ (document.querySelector("#sample-button"));
const rawNotes = /** @type {HTMLTextAreaElement} */ (document.querySelector("#raw-notes"));
const projectName = /** @type {HTMLInputElement} */ (document.querySelector("#project-name"));
const frameRate = /** @type {HTMLSelectElement} */ (document.querySelector("#frame-rate"));
const emptyState = /** @type {HTMLElement} */ (document.querySelector("#empty-state"));
const resultContent = /** @type {HTMLElement} */ (document.querySelector("#result-content"));
const summaryGrid = /** @type {HTMLElement} */ (document.querySelector("#summary-grid"));
const resultNotice = /** @type {HTMLElement} */ (document.querySelector("#result-notice"));
const noteList = /** @type {HTMLOListElement} */ (document.querySelector("#note-list"));
const exportActions = /** @type {HTMLElement} */ (document.querySelector("#export-actions"));
const formMessage = /** @type {HTMLElement} */ (document.querySelector("#form-message"));
const copyButton = /** @type {HTMLButtonElement} */ (document.querySelector("#copy-button"));
const csvButton = /** @type {HTMLButtonElement} */ (document.querySelector("#csv-button"));
const themeButton = /** @type {HTMLButtonElement} */ (document.querySelector("#theme-button"));
const themeLabel = /** @type {HTMLElement} */ (document.querySelector("#theme-label"));

if (
  !(form instanceof HTMLFormElement) ||
  !(sampleButton instanceof HTMLButtonElement) ||
  !(rawNotes instanceof HTMLTextAreaElement) ||
  !(projectName instanceof HTMLInputElement) ||
  !(frameRate instanceof HTMLSelectElement) ||
  !(emptyState instanceof HTMLElement) ||
  !(resultContent instanceof HTMLElement) ||
  !(summaryGrid instanceof HTMLElement) ||
  !(resultNotice instanceof HTMLElement) ||
  !(noteList instanceof HTMLOListElement) ||
  !(exportActions instanceof HTMLElement) ||
  !(formMessage instanceof HTMLElement) ||
  !(copyButton instanceof HTMLButtonElement) ||
  !(csvButton instanceof HTMLButtonElement) ||
  !(themeButton instanceof HTMLButtonElement) ||
  !(themeLabel instanceof HTMLElement)
) {
  throw new Error("NoteDock could not initialize its required controls.");
}

let currentResult = parseRevisionNotes("");

sampleButton.addEventListener("click", () => {
  projectName.value = "Launch film — revision 2";
  rawNotes.value = sample;
  formMessage.textContent = "Sample loaded. Normalize it when you are ready.";
  rawNotes.focus();
  rawNotes.setSelectionRange(0, 0);
  rawNotes.scrollTop = 0;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "Normalizing notes…";
  const result = parseRevisionNotes(rawNotes.value, Number(frameRate.value));
  if (result.notes.length === 0) {
    formMessage.textContent = "Add at least one revision note. Source headers alone are not notes.";
    rawNotes.setAttribute("aria-invalid", "true");
    return;
  }
  rawNotes.removeAttribute("aria-invalid");
  rawNotes.scrollTop = 0;
  currentResult = result;
  renderResult();
  formMessage.textContent = `${result.stats.total} notes normalized locally.`;
});

function renderResult() {
  emptyState.hidden = true;
  resultContent.hidden = false;
  exportActions.hidden = false;

  const summaries = [
    ["Total", currentResult.stats.total],
    ["Timed", currentResult.stats.timed],
    ["Untimed", currentResult.stats.untimed],
    ["Repeats", currentResult.stats.duplicates],
  ];
  summaryGrid.replaceChildren(
    ...summaries.map(([label, value]) => {
      const card = document.createElement("div");
      card.className = "summary-card";
      const strong = document.createElement("strong");
      strong.textContent = String(value);
      const span = document.createElement("span");
      span.textContent = String(label);
      card.append(strong, span);
      return card;
    }),
  );

  resultNotice.textContent =
    currentResult.issues.length > 0
      ? currentResult.issues.join(" ")
      : "Every note has a timeline position and no exact repeats were found.";

  noteList.replaceChildren(
    ...currentResult.notes.map((note) => {
      const item = document.createElement("li");
      item.className = "note-card";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", `Mark revision complete: ${note.text}`);

      const body = document.createElement("div");
      const top = document.createElement("div");
      top.className = "note-topline";

      const time = document.createElement("span");
      time.className = "timecode";
      time.textContent = note.timecode ?? "Needs placement";
      top.append(time);

      const source = document.createElement("span");
      source.className = "source-pill";
      source.textContent = note.source;
      top.append(source);

      if (note.stackSize > 1) {
        const flag = document.createElement("span");
        flag.className = "flag";
        flag.textContent = `${note.stackSize} at this moment`;
        top.append(flag);
      }
      if (note.duplicate) {
        const duplicate = document.createElement("span");
        duplicate.className = "flag flag-duplicate";
        duplicate.textContent = "Exact repeat";
        top.append(duplicate);
      }

      const text = document.createElement("p");
      text.className = "note-text";
      text.textContent = note.text;

      const meta = document.createElement("div");
      meta.className = "note-meta";
      meta.textContent = `${note.reviewer} · input line ${note.inputLine}`;
      body.append(top, text, meta);
      item.append(checkbox, body);
      return item;
    }),
  );
}

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(toMarkdown(projectName.value, currentResult.notes));
    formMessage.textContent = "Markdown checklist copied.";
  } catch {
    formMessage.textContent = "Could not copy Markdown. Download CSV instead.";
  }
});

csvButton.addEventListener("click", () => {
  const blob = new Blob([toCsv(currentResult.notes)], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(projectName.value || "revision-checklist")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  formMessage.textContent = "CSV checklist downloaded.";
});

themeButton.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(isDark));
  themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
});

/**
 * @param {string} value
 * @returns {string}
 */
function slugify(value) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-") || "revision-checklist"
  );
}
