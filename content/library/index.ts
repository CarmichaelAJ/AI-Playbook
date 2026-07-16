// ─── Library / HQ content (Sprint 1) ─────────────────────────────────────────
// Source of truth: content-source/CONTEXT-PACKS.md (PACK S = the strategy stack)
// and content-source/context-verification-13jul.md (exact official URLs + warnings).
//
// RULE: the app LINKS and CITES — it never mirrors document text or asserts
// authorization status. Every entry carries issuer·date + verified_as_of.
//
// ⚠️ VERIFICATION NOTE (product-owner duty A19 / CONTEXT-PACKS maintenance):
//   - Exact e-Publishing / af.mil PDF URLs below come straight from the 14 Jul 2026
//     verification table. C-confidence items still deserve a CAC spot-check of the
//     cover page/edition before public release.
//   - Strategy-stack items 1, 2 and 4 link to the correct OFFICIAL DOMAIN landing
//     (media.defense.gov / af.mil) — the exact public-PDF path wasn't captured in
//     the 14 Jul sweep, so re-verify the deep link before ship. Better a correct
//     domain than a wrong path (CONTEXT-PACKS: "a wrong pub number is worse than none").

import type { ContentItem } from "@/content/schema";

const VERIFIED = "2026-07-14";
const REVIEW_DUE = "2026-08-14"; // monthly during the sprint

// ═══════════════════════════════════════════════════════════════════════════════
// PACK S — THE STRATEGY STACK (rungs 1–5; the "YOU" rung is rendered by HQ itself)
// ═══════════════════════════════════════════════════════════════════════════════
export const STRATEGY_STACK: ContentItem[] = [
  {
    id: "stack-secwar-ai",
    type: "doc",
    title: "SecWar AI Strategy — \"AI-First\"",
    category: "strategy",
    connectors: [],
    stack_order: 1,
    issuer: "Department of War",
    issued: "2026-01-12",
    translation_line:
      "The Pentagon ordered the whole force to adopt AI at wartime speed: \"speed, iteration, and adoption — not perfection.\"",
    official_url: "https://media.defense.gov/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "stack-2026-nds",
    type: "doc",
    title: "2026 National Defense Strategy",
    category: "strategy",
    connectors: [],
    stack_order: 2,
    issuer: "Department of War",
    issued: "2026-01-23",
    translation_line:
      "The top-level plan the DAF's AI strategies align to — AI adoption is a stated national-defense priority.",
    official_url: "https://media.defense.gov/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "stack-daf-ai-data",
    type: "doc",
    title: "DAF AI + Data Strategies",
    category: "strategy",
    connectors: [],
    stack_order: 3,
    issuer: "SecAF Meink · released 20 Apr 2026",
    issued: "2026-04-20",
    translation_line:
      "The Air Force's roadmap to become an \"AI-first force\" — out-think, out-maneuver, out-pace any adversary.",
    official_url: "https://www.af.mil/News/Article-Display/Article/4467267/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "stack-daf-talent-plan",
    type: "doc",
    title: "DAF AI Hiring & Talent Development Plan",
    category: "strategy",
    connectors: [],
    stack_order: 4,
    issuer: "DAF CDAO (Davenport) · Apr 2026",
    issued: "2026-04-28",
    translation_line:
      "Mandates a baseline of AI literacy for EVERY Airman — not just specialists. That includes you.",
    official_url: "https://www.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "stack-ai-coe-genaimil",
    type: "doc",
    title: "DAF AI Center of Excellence · GenAI.mil",
    category: "strategy",
    connectors: [],
    stack_order: 5,
    issuer: "DAF CDAO · standing up now (FOC 2026)",
    issued: "2026-05-01",
    translation_line:
      "The engine room: faster adoption, fewer barriers — and the approved AI tools already on your desktop.",
    official_url: "https://www.genai.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// THE SHELVES — docs, forms, toolkits, sites, training
// ═══════════════════════════════════════════════════════════════════════════════
export const LIBRARY: ContentItem[] = [
  // ─── Toolkits ────────────────────────────────────────────────────────────────
  {
    id: "cdao-rai-toolkit",
    type: "doc",
    title: "CDAO Responsible AI Toolkit",
    category: "toolkit",
    connectors: [],
    issuer: "DoW CDAO",
    issued: "2023-11-01",
    translation_line: "The official responsible-AI kit — checklists and worksheets you can actually run.",
    official_url: "https://www.ai.mil/About/Resources/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "cdao-rai-genai-toolkit",
    type: "doc",
    title: "CDAO RAI Generative AI Toolkit v1.0",
    category: "toolkit",
    connectors: [],
    issuer: "DoW CDAO",
    issued: "2024-12-01",
    translation_line: "Responsible-use guidance built specifically for generative AI — the how-to for tools like GenAI.mil.",
    official_url: "https://www.ai.mil/About/Resources/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "dod-data-ai-adoption",
    type: "doc",
    title: "DoD Data, Analytics & AI Adoption Strategy",
    category: "toolkit",
    connectors: [],
    issuer: "DoD CDAO",
    issued: "2023-11-01",
    translation_line: "The foundation the newer strategies build on — how the department decided to adopt AI at scale.",
    official_url: "https://www.ai.mil/About/Resources/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },

  // ─── Pubs & Forms (the standards your plays write toward) ─────────────────────
  {
    id: "afi-36-2406",
    type: "doc",
    title: "AFI 36-2406, Officer and Enlisted Evaluation Systems",
    category: "guidance",
    connectors: [],
    issuer: "DAF · 22 Aug 2025 (incl. Change 1, 27 May 2026)",
    issued: "2026-05-27",
    translation_line: "The reg that governs evaluations. Note: it reverted from DAFI to AFI — don't cite \"DAFI 36-2406.\"",
    official_url: "https://static.e-publishing.af.mil/production/1/af_a1/publication/afi36-2406/afi36-2406.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "enlisted-force-structure",
    type: "doc",
    title: "The Enlisted Force Structure (Brown Book)",
    category: "guidance",
    connectors: [],
    issuer: "CMSAF · 4 Sep 2025",
    issued: "2025-09-04",
    translation_line: "What's expected of you at every rank — including the foundational competencies your record is judged against.",
    official_url: "https://www.airuniversity.af.edu/Portals/10/Foundational-Resources/Enlisted-Force-Structure-Sep2025.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "airman-leadership-qualities",
    type: "doc",
    title: "The 10 Airman Leadership Qualities",
    category: "guidance",
    connectors: [],
    issuer: "af.mil",
    issued: "2025-09-04",
    translation_line: "The ten qualities your EPB is scored against — write toward them; imply them, never name them in a statement.",
    official_url: "https://www.af.mil/News/Article-Display/Article/2490030/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "alq-writing-guide",
    type: "doc",
    title: "ALQ Writing Guide",
    category: "guidance",
    connectors: [],
    issuer: "AFPC / ARPC",
    issued: "2025-01-01",
    translation_line: "The official how-to for writing to the Airman Leadership Qualities — plain guidance for narrative statements.",
    official_url: "https://www.arpc.afrc.af.mil/Portals/4/ALQ%20Writing%20Guide.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "dafi-36-2803",
    type: "doc",
    title: "DAFI 36-2803, Military Decorations and Awards Program",
    category: "guidance",
    connectors: [],
    issuer: "DAF",
    issued: "2022-05-03",
    translation_line: "The program-level instruction behind decorations and awards — the rules the package process follows.",
    official_url: "https://static.e-publishing.af.mil/production/1/af_a1/publication/dafi36-2803/dafi36-2803.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "dafman-36-2806",
    type: "doc",
    title: "DAFMAN 36-2806, Military Awards: Criteria and Procedures",
    category: "guidance",
    connectors: [],
    issuer: "DAF · 27 Oct 2022",
    issued: "2022-10-27",
    translation_line: "The criteria-and-procedures manual for awards. (The old 2019 \"Awards and Memorialization\" title is dead.)",
    official_url: "https://static.e-publishing.af.mil/production/1/af_a1/publication/dafman36-2806/dafman36_2806.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "daf-form-1206",
    type: "doc",
    title: "DAF Form 1206, Nomination for Award",
    category: "guidance",
    connectors: [],
    issuer: "DAF · ~Mar 2024 edition",
    issued: "2024-03-13",
    translation_line: "The nomination form itself (renamed from AF Form 1206). Confirm the current edition before you build a package.",
    official_url: "https://static.e-publishing.af.mil/production/1/af_a1/form/daf1206/daf1206.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "dafh-33-337-tongue-quill",
    type: "doc",
    title: "DAFH 33-337, The Tongue and Quill",
    category: "guidance",
    connectors: [],
    issuer: "DAF · 16 Dec 2022 edition",
    issued: "2022-12-16",
    translation_line: "The DAF writing standard — memos, formats, email discipline. Link only e-Publishing; obsolete 2015 copies are everywhere.",
    official_url: "https://static.e-publishing.af.mil/production/1/saf_cn/publication/afh33-337/afh33-337.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "dafman-36-2100",
    type: "doc",
    title: "DAFMAN 36-2100, Military Utilization and Classification",
    category: "guidance",
    connectors: [],
    issuer: "DAF · 7 Jul 2026",
    issued: "2026-07-07",
    translation_line: "The classification manual behind AFSCs. Confirm AFSC codes here before any job-specific content ships.",
    official_url: "https://static.e-publishing.af.mil/production/1/af_a1/publication/dafman36-2100/dafman36-2100.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },

  // ─── Official Sites (the doors) ───────────────────────────────────────────────
  {
    id: "site-epublishing",
    type: "site",
    title: "DAF e-Publishing",
    category: "site",
    connectors: [],
    issuer: "Official site · always current",
    issued: "2026-07-01",
    translation_line: "The only authoritative source for every AFI, DAFI, DAFMAN, and form. If a reg matters, confirm it here.",
    official_url: "https://www.e-publishing.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-myfss",
    type: "site",
    title: "myFSS",
    category: "site",
    connectors: [],
    issuer: "Official site · CAC",
    issued: "2026-07-01",
    translation_line: "Where personnel actions live — evaluations (myEval), awards, records. CAC required.",
    official_url: "https://www.myfss.us.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-af-portal",
    type: "site",
    title: "Air Force Portal",
    category: "site",
    connectors: [],
    issuer: "Official site · CAC",
    issued: "2026-07-01",
    translation_line: "The enterprise front door — templates, apps, and links across the DAF. CAC required.",
    official_url: "https://my.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-genaimil",
    type: "site",
    title: "GenAI.mil",
    category: "site",
    connectors: [],
    issuer: "DoW CDAO · launched 9 Dec 2025",
    issued: "2025-12-09",
    translation_line: "The enterprise generative-AI platform — start here to run your plays. Certified for CUI use.",
    official_url: "https://www.genai.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-asksage",
    type: "site",
    title: "Ask Sage",
    category: "site",
    connectors: [],
    issuer: "Approved tool",
    issued: "2026-02-01",
    translation_line: "Another approved AI destination for running plays — the government login is at chat.asksage.ai.",
    official_url: "https://chat.asksage.ai/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-dafcio",
    type: "site",
    title: "DAF CIO",
    category: "site",
    connectors: [],
    issuer: "Official site",
    issued: "2026-07-01",
    translation_line: "The DAF Chief Information Officer — where enterprise IT and AI guardrails guidance is published.",
    official_url: "https://www.dafcio.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-adc",
    type: "site",
    title: "Area Defense Counsel",
    category: "site",
    connectors: [],
    issuer: "Official site",
    issued: "2026-07-01",
    translation_line: "Free, confidential defense attorneys outside your chain of command. See them before responding to any paperwork.",
    official_url: "https://www.scott.af.mil/Units/Area-Defense-Counsel/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-military-onesource",
    type: "site",
    title: "Military OneSource",
    category: "site",
    connectors: [],
    issuer: "Official site · 800-342-9647",
    issued: "2026-07-01",
    translation_line: "Free, confidential help for money, family, and life plays — the professional your Life Plays route you to.",
    official_url: "https://www.militaryonesource.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-af-glossary",
    type: "site",
    title: "Air Force Glossary",
    category: "site",
    connectors: [],
    issuer: "LeMay Center · public PDF",
    issued: "2026-04-20",
    translation_line: "The public glossary of Air Force terms and acronyms — for when a document assumes you already know one.",
    official_url: "https://www.doctrine.af.mil/Portals/61/documents/AFDP_Air-Force-Glossary/AF-GLOSSARY.pdf",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },

  // ─── Training ─────────────────────────────────────────────────────────────────
  {
    id: "site-digital-university",
    type: "site",
    title: "Digital University",
    category: "training",
    connectors: [],
    issuer: "DAF · digitalu.af.mil",
    issued: "2026-07-01",
    translation_line: "Free DAF training — including AI and data courses. The depth layer when a play makes you want to go further.",
    official_url: "https://digitalu.af.mil/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
  {
    id: "site-ai-mil-resources",
    type: "site",
    title: "ai.mil — CDAO Resources",
    category: "training",
    connectors: [],
    issuer: "DoW CDAO",
    issued: "2026-07-01",
    translation_line: "The public home for DoD AI resources, toolkits, and press releases — the official picture of where AI is going.",
    official_url: "https://www.ai.mil/About/Resources/",
    verified_as_of: VERIFIED,
    review_due: REVIEW_DUE,
  },
];

// ─── HQ shelf filters — derived labels over the categories actually present ─────
// NOTE (product-owner): the build package named a "Memos & Letters" chip, but the
// verified 14 Jul content carries governing pubs + a form, not memos — so that chip
// is "Pubs & Forms" here. Flag for Mike; trivial to relabel.
export interface ShelfFilter { id: string; label: string; }
export const SHELF_FILTERS: ShelfFilter[] = [
  { id: "all", label: "All" },
  { id: "strategy", label: "Strategies" },
  { id: "guidance", label: "Pubs & Forms" },
  { id: "toolkit", label: "Toolkits" },
  { id: "site", label: "Official Sites" },
  { id: "training", label: "Training" },
];

// Every shelf item (stack + library), for the filterable shelves.
export const ALL_LIBRARY: ContentItem[] = [...STRATEGY_STACK, ...LIBRARY];

// The 3 newest by issue date — HQ tags these "Latest".
export const LATEST_IDS: string[] = [...ALL_LIBRARY]
  .filter((d) => d.issued)
  .sort((a, b) => (a.issued! < b.issued! ? 1 : -1))
  .slice(0, 3)
  .map((d) => d.id);
