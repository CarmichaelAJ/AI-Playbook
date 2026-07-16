// ─── Library link checker ─────────────────────────────────────────────────────
// HEAD-requests every official_url in content/library/index.ts; falls back to a
// byte-range GET where HEAD is blocked (common on .mil CDNs). Reports status per
// URL and a non-200 summary. MANUAL tool (`npm run check:links`) — intentionally
// NOT part of `npm run build`: .mil endpoints are flaky/bot-gated and a CDN
// hiccup must not break deploys.
//
// Known caveat: several .mil hosts (Akamai) 403 non-browser clients outright.
// A 403 here means "blocked the script," not "link is dead" — spot-check those
// in a real browser before treating them as failures.

import fs from "node:fs";

const src = fs.readFileSync("content/library/index.ts", "utf8");
const urls = [...src.matchAll(/official_url:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/pdf,*/*;q=0.8",
};

async function probe(url) {
  const ctl = AbortSignal.timeout(12000);
  try {
    const head = await fetch(url, { method: "HEAD", headers: HEADERS, redirect: "follow", signal: ctl });
    if (head.ok) return { url, status: head.status, via: "HEAD" };
    // Some hosts reject HEAD — retry with a 1-byte GET.
    const get = await fetch(url, {
      method: "GET",
      headers: { ...HEADERS, Range: "bytes=0-0" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    return { url, status: get.status, via: "GET+range" };
  } catch (e) {
    return { url, status: 0, via: `ERROR: ${e.name === "TimeoutError" ? "timeout" : e.message}` };
  }
}

const results = await Promise.all(urls.map(probe));

console.log(`Checked ${results.length} library URLs:\n`);
for (const r of results) {
  const ok = r.status >= 200 && r.status < 400;
  console.log(`${ok ? "✓" : "✗"} ${String(r.status).padStart(3)}  ${r.via.padEnd(10)} ${r.url}`);
}

const bad = results.filter((r) => !(r.status >= 200 && r.status < 400));
console.log(
  bad.length === 0
    ? "\n✓ All library links respond OK."
    : `\n✗ ${bad.length} link(s) did not return 2xx/3xx — spot-check in a browser (bot-gating 403s are expected on some .mil hosts).`,
);
