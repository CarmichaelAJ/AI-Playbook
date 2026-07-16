// ─── Derived content counts ───────────────────────────────────────────────────
// Computed from the arrays — NEVER hardcoded. The HQ receipts strip reads these,
// so the numbers can never drift from the actual content.

import { PLAYS } from "@/content/plays";
import { ALL_LIBRARY } from "@/content/library";

export const PLAY_COUNT = PLAYS.length;
export const DOC_COUNT = ALL_LIBRARY.filter((i) => i.type === "doc").length;
export const SITE_COUNT = ALL_LIBRARY.filter((i) => i.type === "site").length;
export const SOURCE_COUNT = ALL_LIBRARY.length; // every official source on the shelves
