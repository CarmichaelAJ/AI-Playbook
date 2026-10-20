import type { ContentAccess } from "@/content/access";

// Plays live inside communities. This file is the single place that connects them.
//
// A play can be listed in several communities (the order of a community's list is the
// order people see it). The first community a play appears in, in the order of
// PLAY_COMMUNITY_LISTS, is its "home" community: the one a deep link, a saved item, or a
// search result opens in. Search and cards always show every other community too.
//
// These associations are editorial starting points pending SME review. They are not an
// authoritative mapping of plays to AFSCs.
export const PLAY_COMMUNITY_LISTS: Record<string, string[]> = {
  "front-office-admin": ["mfr-one-pass", "email-that-gets-answered", "award-1206", "epb-forge"],
  "maintainers": ["process-map-constraint", "brief-improvement", "deep-research-brief"],
  "cyber-comm": ["claim-audit", "process-map-constraint", "email-that-gets-answered"],
  "security-forces": ["mfr-one-pass", "paperwork-response", "tradeoff-matrix", "pre-mortem"],
  "logistics": ["process-map-constraint", "tradeoff-matrix", "brief-improvement"],
  "medical": ["email-that-gets-answered", "claim-audit", "process-map-constraint"],
  "intel-ops": ["deep-research-brief", "claim-audit", "tradeoff-matrix", "pre-mortem", "red-team-review"],
  "acquisition-contracting": ["deep-research-brief", "claim-audit", "tradeoff-matrix", "brief-improvement"],
  "command-teams": ["tradeoff-matrix", "pre-mortem", "red-team-review", "brief-improvement"],
  "training-education": ["deep-research-brief", "brief-improvement", "process-map-constraint"],
  "epb-narratives": ["epb-forge"],
};

// A community-specific adaptation of a broad play. It points at the base play instead of
// copying it, so the verbatim prompt (see content/schema.ts) stays in exactly one place.
// An adaptation may add community-specific guidance; it must never restate the prompt.
export interface PlayAdaptation {
  id: string;
  basePlayId: string;
  communityId: string;
  title: string;
  // What changes for this community. Plain text, reviewed by that community's SMEs.
  summary: string;
  access: ContentAccess;
}

// None are authored yet: adaptations need review from the community they are written for.
export const PLAY_ADAPTATIONS: PlayAdaptation[] = [];
