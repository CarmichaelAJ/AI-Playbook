// ─── Play shelf categories (Sprint 1 — 12 deep plays) ────────────────────────
// The 12 MVP plays group into three situation bands. AFSC filtering is retired for
// this set (deep, career-field-agnostic plays over shallow job-specific prompts).

import type { Level } from "@/content/schema";

export interface PlayCategoryMeta {
  id: string;
  label: string;
  blurb: string;
  level?: Level;
}

export const PLAY_CATEGORIES: PlayCategoryMeta[] = [
  { id: "think", label: "Think & Decide", blurb: "Research, weigh options, and pressure-test a decision before you commit." },
  { id: "improve", label: "Improve the Process", level: 3, blurb: "Map the flow, find the constraint, and build the case to fix it." },
  { id: "write", label: "Write It Right", blurb: "EPBs, awards, MFRs, paperwork responses, and email that gets answered." },
];

export function categoryLabel(id: string): string {
  return PLAY_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
