# NEXT — follow-ons after the Doctrine v1.1 compliance pass

This pass brought the build into compliance with **App Doctrine v1.1 (9 Jul 2026)**:
situation-first plays, the Two Roads / Three Levels model, the doctrine lexicon,
a conduit-identity User Guide, expandable Tools with the fixed access-path schema,
and a v1 responsive pass. No model calls, no `app/api`, no Anthropic SDK.

## Structural changes this pass
- **`lib/plays.ts`** — rebuilt around a situation `category` axis (Evaluations,
  Awards & Recognition, Promotion & Boards, Write It Right, Communicate,
  Research & Decide, Improve the Process [Level 3], Life Plays). `afsc` is now an
  optional filter tag, not the entry point. Added `level`, `advanced` (the
  Council), and `lifeGuardrail`. `orderPlays` → `playsByCategory` + `ADVANCED_PLAYS`.
- **`lib/mock/tools.ts`** — fixed schema: `whatItIs` (hard cap), linked
  `authorization`, `accessPath[]`, `accessVerified`. Section `digital` → `platforms`.
- **Deleted** `lib/mode.ts` + `components/ContextModeToggle.tsx` (device/mode
  mechanic dropped — routing is by intent, not device). **Deleted**
  `components/SurfaceRouting.tsx`; replaced by `components/RunItRouting.tsx`
  (GenAI.mil-first). `lib/links.ts` retired the four-surfaces config.

## Still SME / product-owner work (content is placeholder)
- **Play content** — all starter prompts, task framing, form/system references,
  never-paste lines, verify steps, and time-back estimates are illustrative and
  need SME validation. Category slotting (esp. DTS + Additional Duty in Research
  & Decide) is a product-owner call.
- **Tools access paths** — every `accessPath` + `authorization` ships as a DRAFT
  ("pending verification"). Re-verify from a CAC-enabled workstation; fill
  `authorization.sourceUrl` where empty. This is a standing product-owner duty.
- **AI 101 training links** — Digital University / DAF-enterprise / CDAO URLs are
  empty (render "Link pending"). Add verified official URLs. The `<!-- CONTENT
  SLOT -->` awaits the owner's AI-101 outline.
- **AFSC tiles** in `AFSC_TILES` are example codes/nicknames pending SME confirmation.

## FLAGGED — pending product-owner adjudication (left verbatim, commented in code)
- "Built for Airmen, by Airmen" tagline (`app/page.tsx`).
- The safety-by-design block wording (`app/page.tsx`) — still contains
  "verify every output before official use"; posture is fine, phrasing unratified.
- The suggest-a-play form (Home, Plays, Guide).
- "Copilot Studio" tool name (`lib/mock/tools.ts` t29) — a named MS builder, not
  one of the three controlled AI surfaces.

## Out of scope this pass (Doctrine §5 — deferred, not unwanted)
- Official tool logos · profiles / sign-in / analytics · AFSC-depth navigation ·
  desktop layout maturity beyond the v1 responsive pass · PDF / deep-read export ·
  restructuring play navigation around the Three Levels as tiers (v1 educates only).
