// ─── Typed content layer (Sprint 1) ──────────────────────────────────────────
// One schema for every kind of content the app renders: plays, library docs and
// sites, the strategy stack, and (later) agent builds / automation flows. The app
// LINKS and CITES — it never mirrors document text or asserts authorization status.
//
// VERBATIM RULE (non-negotiable): a play's prompt_template is the exact engineered
// prompt from content-source/PLAYS-MVP-v1.md, with {{slot}} tokens. assemblePrompt()
// reproduces it character-for-character; the five body_segments are the on-card
// anatomy (presentation), and must stay faithful excerpts of that same prompt.

export type ContentType = "play" | "build" | "flow" | "doc" | "site" | "tool" | "pack";

export type Level = 1 | 2 | 3;

// A fill-in slot inside a play prompt. `token` is the EXACT bracket text from the
// source prompt (e.g. "QUESTION" → "[QUESTION]"), so an empty slot reassembles the
// prompt verbatim. `label`/`placeholder` are the friendly on-card presentation.
export interface FeedSlot {
  key: string;          // matches {{key}} in prompt_template
  token: string;        // exact source bracket text; empty state renders `[${token}]`
  label: string;        // friendly field label on the card
  placeholder: string;  // example / hint text
  multiline?: boolean;
}

// The five-part on-card anatomy (Play Card 2.0). `verify` is the Airman's own
// checklist — it is NOT part of the assembled prompt.
export interface BodySegments {
  persona: string;   // WHO THE AI IS
  task: string;      // THE JOB
  feed_slots: FeedSlot[]; // WHAT YOU FEED IT
  format: string;    // WHAT COMES BACK
  verify: string[];  // PROVE IT (checklist; app-side only)
}

// One coaching "why" line per anatomy segment (plain Airman language).
export interface SegmentWhy {
  persona?: string;
  task?: string;
  feed?: string;
  format?: string;
}

export interface RunOn {
  surfaces: string[];       // where to run it: GenAI.mil, Ask Sage, Envision…
  connector_note?: string;  // e.g. "turn ON GAMECHANGER first"
}

export interface DeeperLink {
  label: string;
  note?: string;
}

export interface Provenance {
  label: string;
  url?: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;

  // Plays: the situation line ("I need to…"). Docs/sites: unused.
  situation?: string;
  category: string;
  level?: Level;
  connectors: string[];

  // ─── Play fields ───────────────────────────────────────────────────────────
  contract?: string;          // "You walk away with…" (derived from format)
  prompt_template?: string;   // VERBATIM prompt with {{slot}} tokens
  body_segments?: BodySegments;
  segment_why?: SegmentWhy;
  run_on?: RunOn;
  never_paste?: string;       // the safety bar line
  deeper_links?: DeeperLink[];
  time_back?: string;
  sensitive?: boolean;        // Play 11 — renders CUI caution + disclaimer up top

  // ─── Library fields (doc / site) ───────────────────────────────────────────
  provenance?: Provenance[];
  // Milestone vs. Living (product-owner rule, FIX-1): milestone docs are static,
  // signed, historic — hosted in-app at hosted_path with a prominent link to the
  // official source. Living docs (regs, forms, hubs) are NEVER hosted; deep link only.
  doc_class?: "milestone" | "living";
  hosted_path?: string;       // /docs/<file>.pdf under public/ (milestones only)
  translation_line?: string;  // plain-language "what this means for you"
  issuer?: string;            // who published it (for the issuer·date meta line)
  issued?: string;            // ISO date the source was issued/effective (drives "Latest")
  official_url?: string;
  verified_as_of?: string;    // ISO date, e.g. "2026-07-14"
  review_due?: string;        // ISO date the entry is re-verified by
  stack_order?: number;       // strategy-stack rung 1–5 (PACK S)
}

// ─── Verbatim assembly ────────────────────────────────────────────────────────
// Replace each {{key}} with the Airman's slot value, or — when empty — the exact
// original bracket token, so the empty-state prompt is byte-identical to the source.
export function assemblePrompt(
  item: ContentItem,
  values: Record<string, string> = {},
): string {
  if (!item.prompt_template) return "";
  let out = item.prompt_template;
  for (const slot of item.body_segments?.feed_slots ?? []) {
    const filled = (values[slot.key] ?? "").trim();
    const replacement = filled.length > 0 ? filled : `[${slot.token}]`;
    out = out.split(`{{${slot.key}}}`).join(replacement);
  }
  return out;
}
