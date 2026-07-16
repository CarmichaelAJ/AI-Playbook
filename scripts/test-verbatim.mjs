// ─── Verbatim reassembly test (QA gate) ───────────────────────────────────────
// Rule 2 of the mission brief: play prompt text is verbatim. This test extracts
// the 12 source prompts from content-source/PLAYS-MVP-v1.md, reconstructs each
// play's empty-state prompt from content/plays/index.ts (template + slot tokens,
// exactly as assemblePrompt() does), and diffs. Exit 1 on any mismatch.
// Run via `npm run test:verbatim`.

import fs from "node:fs";

const md = fs.readFileSync("content-source/PLAYS-MVP-v1.md", "utf8");
const ts = fs.readFileSync("content/plays/index.ts", "utf8");

// 1 · Source prompts: the blockquote under each "### PLAY N" heading.
const srcPrompts = [];
const lines = md.split(/\r?\n/);
let i = 0;
while (i < lines.length) {
  if (/^### PLAY \d+/.test(lines[i])) {
    let j = i + 1;
    while (j < lines.length && !/^>/.test(lines[j])) j++;
    const buf = [];
    while (j < lines.length && /^>/.test(lines[j])) {
      buf.push(lines[j].replace(/^> ?/, ""));
      j++;
    }
    srcPrompts.push(buf.join("\n").trim());
    i = j;
  } else i++;
}

// 2 · App prompts: prompt_template with each {{key}} replaced by its [TOKEN] —
//     the exact empty-state output of assemblePrompt().
const blocks = ts.split(/\n  \{\n/).slice(1);
const tgtPrompts = [];
for (const b of blocks) {
  const tmplMatch = b.match(/prompt_template:\s*\n?\s*"((?:[^"\\]|\\.)*)"/s);
  if (!tmplMatch) continue;
  let tmpl = JSON.parse(`"${tmplMatch[1]}"`);
  const slotRe = /\{ key: "([^"]+)", token: "((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = slotRe.exec(b)) !== null) {
    tmpl = tmpl.split(`{{${m[1]}}}`).join(`[${JSON.parse(`"${m[2]}"`)}]`);
  }
  tgtPrompts.push(tmpl.trim());
}

// 3 · Diff.
let fails = 0;
if (srcPrompts.length !== 12 || tgtPrompts.length !== 12) {
  console.error(`✗ Expected 12 prompts each: source=${srcPrompts.length}, app=${tgtPrompts.length}`);
  fails++;
}
for (let k = 0; k < Math.min(srcPrompts.length, tgtPrompts.length); k++) {
  const a = srcPrompts[k];
  const b = tgtPrompts[k];
  if (a === b) continue;
  fails++;
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  console.error(`✗ PLAY ${k + 1} mismatch at char ${p}:`);
  console.error(`    src …${JSON.stringify(a.slice(Math.max(0, p - 20), p + 40))}`);
  console.error(`    app …${JSON.stringify(b.slice(Math.max(0, p - 20), p + 40))}`);
}

if (fails) {
  console.error(`\n✗ Verbatim test failed (${fails}). The doctrine outranks the build.`);
  process.exit(1);
}
console.log("✓ Verbatim test: all 12 plays reassemble exactly.");
