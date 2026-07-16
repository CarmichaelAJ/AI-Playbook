// ─── Lexicon lint — doctrine language gate ────────────────────────────────────
// Scans Airman-facing content (content/ + app UI + components) for banned terms.
// Exit 1 on any violation; prints file:line for each. Run via `npm run lint:lexicon`
// (wired into `npm run build` so a violation fails the pipeline).
//
// Banned (mission brief, non-negotiable rules):
//   · IL2 / IL4 / IL5 / FedRAMP / CAC-gated impact-level jargon
//   · "leverage"
//   · "cut" as the Airman's action verb (heuristic: "cut your/the/down …" in copy)
//   · "surfaces" as a noun for tools
//   · "verify before it goes official"
//   · NIPRGPT (dead — sunset 31 Dec 2025; route to GenAI.mil)
//   · commercial vendors as ROUTING destinations (ChatGPT / Claude / Gemini /
//     Copilot near routing verbs). Vendors may appear as facts inside Power
//     Platform tool descriptions or provenance — flagged lines list the exception.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["content", "app", "components", "lib"];
const EXTS = new Set([".ts", ".tsx", ".mjs", ".css"]);
const SKIP = [/node_modules/, /\.next/, /content-source/, /scripts/];

// Each rule: name, regex, and an optional per-line allowlist test.
const RULES = [
  { name: "impact-level jargon (IL2/IL4/IL5)", re: /\bIL[245]\b/ },
  { name: "FedRAMP jargon", re: /\bFedRAMP\b/i },
  { name: "CAC-gated jargon", re: /\bCAC-gated\b/i },
  { name: '"leverage"', re: /\bleverage[sd]?\b/i },
  { name: "NIPRGPT (dead — use GenAI.mil)", re: /\bNIPRGPT\b/i },
  { name: '"verify before it goes official"', re: /verify before it goes official/i },
  {
    name: '"surfaces" as noun for tools',
    re: /\b(the|approved|four|multiple|AI)\s+surfaces\b/i,
  },
  {
    name: '"cut" as Airman action verb',
    re: /\b[Cc]ut(s|ting)?\s+(your|the|down|out|my|our)\b/,
  },
  {
    name: "commercial vendor as routing destination",
    re: /\b(run|paste|open|go to|start|launch|route[sd]?|take)\b[^.\n]{0,40}\b(ChatGPT|Claude|Gemini|Copilot)\b|\b(ChatGPT|Claude|Gemini|Copilot)\b[^.\n]{0,25}\b(and (go|run)|first|to run)\b/i,
    // Allowed as FACT inside Power Platform / GenAI.mil platform descriptions and provenance.
    allow: (line) => /Power (Platform|Automate|Apps?|BI)|Copilot Studio|provenance|Gemini for Government/i.test(line),
  },
];

// Lint comments too? Comments aren't Airman-facing, but leaked jargon in comments
// tends to leak into copy — still, the mission brief scopes rules to Airman-facing
// strings. We skip pure comment lines to avoid false positives on enforcement notes.
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*|\{\/\*)/;

let violations = 0;

function scanFile(file) {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (COMMENT_LINE.test(line)) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        if (rule.allow && rule.allow(line)) continue;
        violations++;
        console.log(`${rel}:${i + 1}  [${rule.name}]`);
        console.log(`    ${line.trim().slice(0, 160)}`);
      }
    }
  });
}

function walk(dir) {
  if (SKIP.some((re) => re.test(dir))) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP.some((re) => re.test(full))) continue;
    if (entry.isDirectory()) walk(full);
    else if (EXTS.has(path.extname(entry.name))) scanFile(full);
  }
}

for (const d of SCAN_DIRS) {
  const full = path.join(ROOT, d);
  if (fs.existsSync(full)) walk(full);
}

if (violations > 0) {
  console.error(`\n✗ Lexicon lint: ${violations} violation(s). If an Airman wouldn't say it at the shop, it doesn't ship.`);
  process.exit(1);
} else {
  console.log("✓ Lexicon lint: clean.");
}
