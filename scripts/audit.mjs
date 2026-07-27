import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2];
const ignored = new Set([".git", "node_modules", "playwright-report", "test-results", "proof"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs"]);

/**
 * @param {string} directory
 * @returns {string[]}
 */
function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (ignored.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const sourceFiles = files(root).filter((path) => textExtensions.has(extname(path)));
const failures = [];

if (mode === "format") {
  for (const path of sourceFiles) {
    const content = readFileSync(path, "utf8");
    if (/[ \t]+$/m.test(content)) failures.push(`${relative(root, path)} has trailing whitespace`);
    if (!content.endsWith("\n")) failures.push(`${relative(root, path)} needs a final newline`);
    if (content.includes("\t")) failures.push(`${relative(root, path)} contains a tab`);
  }
}

if (mode === "lint") {
  for (const path of sourceFiles.filter(
    (path) => [".js", ".mjs"].includes(extname(path)) && !path.endsWith("scripts/audit.mjs"),
  )) {
    const content = readFileSync(path, "utf8");
    if (content.includes("console.log") && !path.endsWith("serve.mjs")) {
      failures.push(`${relative(root, path)} contains console.log`);
    }
    if (content.includes("innerHTML")) failures.push(`${relative(root, path)} uses innerHTML`);
    if (content.includes("eval(")) failures.push(`${relative(root, path)} uses eval`);
  }
}

if (mode === "secrets") {
  const secretPatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  ];
  for (const path of sourceFiles) {
    const content = readFileSync(path, "utf8");
    if (secretPatterns.some((pattern) => pattern.test(content))) {
      failures.push(`${relative(root, path)} matches a credential pattern`);
    }
  }
}

if (mode === "license") {
  /** @type {{license?: string, devDependencies?: Record<string, string>}} */
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (packageJson.license !== "MIT") failures.push("package.json must declare MIT");
  if (!statSync(join(root, "LICENSE")).isFile()) failures.push("LICENSE is missing");
  const allowed = new Set(["MIT", "Apache-2.0", "ISC", "BSD-2-Clause", "BSD-3-Clause"]);
  for (const dependency of Object.keys(packageJson.devDependencies || {})) {
    const dependencyPackage = join(root, "node_modules", dependency, "package.json");
    /** @type {{license?: string}} */
    const metadata = JSON.parse(readFileSync(dependencyPackage, "utf8"));
    const license = typeof metadata.license === "string" ? metadata.license : "";
    if (![...allowed].some((item) => license.includes(item))) {
      failures.push(`${dependency} reports unsupported license: ${license || "unknown"}`);
    }
  }
}

if (!["format", "lint", "secrets", "license"].includes(mode)) {
  failures.push(`Unknown audit mode: ${mode || "missing"}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${mode} audit passed for ${sourceFiles.length} tracked text files.`);
}
