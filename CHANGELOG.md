# Changelog

## [Unreleased] — Navigation, communities, and memorandum rework

### Added
- Header with the Air Force symbol (`public/assets/af-symbol-white.svg`), direct Search and Sign in, and a hamburger side menu that works by keyboard and pointer ([components/SiteHeader.tsx](components/SiteHeader.tsx)).
- Full-screen home hero with four working routes ([components/HomeHero.tsx](components/HomeHero.tsx)) and a `/sign-in` route that reuses the existing account dialog.
- Separate-page MFR component (AFH 33-337 Ch. 14), signature draw-on with a reduced-motion static state, and a memo data contract with validation ([components/MfrMemo.tsx](components/MfrMemo.tsx), [components/SignatureDraw.tsx](components/SignatureDraw.tsx), [content/memo.ts](content/memo.ts)). No approved memo has been supplied, so none is shown.
- Community hierarchy with multiple parents and aliases, many-to-many play associations, adaptations that reference a base play, one static page per community, and graph validation ([lib/communityGraph.ts](lib/communityGraph.ts)).
- Search matches community aliases and task language, and every play result shows its communities.
- [docs/RESTRICTED_CONTENT_REQUIREMENTS.md](docs/RESTRICTED_CONTENT_REQUIREMENTS.md) and [docs/MEMO_INTAKE.md](docs/MEMO_INTAKE.md).
- Navigation, community, home, and unit tests.

### Removed
- The standalone Plays page and navigation item (`/plays` redirects to `/communities`).
- The "Concept demonstration" and "Plays are examples — check every draft before you sign it" header lines, and the "not an endorsement" wording in the hero, footer, and strategy section.
- The old CSAF letter, quote, signature crop, and PDF.

### Changed
- Tool links, saved items, and report links open plays inside their home community.
- Service worker cache bumped to v2 and no longer precaches `/plays`.

All notable changes to Airman's AI Playbook's visual identity and front end.
These changes are local and uncommitted; nothing has been deployed.

## [Unreleased] — Art-directed institutional redesign

### Summary

The site moved from a card-and-sidebar application look to an art-directed,
editorial, institutional website. It tells one story:
**leadership intent → institutional direction → Airman adoption → mission
execution.** The primary navigation (Tools, Plays, Comms, Learn, Search) and all
existing workflows are preserved.

### Added

#### Home page
- Cinematic dark hero built from a real C-17 photograph, with a "letterhead" row
  holding the CSAF signature, quotation, and source, and a monumental
  "Airman's AI Playbook" wordmark ([components/LeadershipHero.tsx](components/LeadershipHero.tsx),
  [components/LeadershipHero.module.css](components/LeadershipHero.module.css)).
- Four-step progression strip linking leadership intent, direction, adoption,
  and execution.
- Scenes alternating dark and light ([app/page.tsx](app/page.tsx),
  [app/home.module.css](app/home.module.css)): statement with Academy Chapel plate;
  dark direction scene with Secretary Meink's strategy quote; light adoption scene
  with an Airman photograph and three action paths; large search; dark mission
  execution scene with the three levels; field learning paths; working reference;
  closing statement.
- Plate captions and credits beside every photograph.

#### Leadership signature and sources
- Authentic CSAF signature cropped from Gen. Wilsbach's public letter of
  3 November 2025, shown as white ink on night and revealed once (1.6 s) as the
  identity resolves (1.5 s). It reveals the original scan; it does not recreate
  the handwriting ([content/leadership.ts](content/leadership.ts)).
- Complete local copy of the letter (SHA-256 recorded) and links to the official
  and archived copies.
- Explicit labeling as published leadership intent, **not** a product
  endorsement. The AI strategy quote is separately attributed to Secretary Troy E.
  Meink.

#### Photography
- Six authentic public-domain photographs (resized 1200 px and 2400 px WebP) in
  [public/assets/photography/](public/assets/photography): C-17 at dusk, T-6 under
  hangar arches, Air Force Academy Chapel, an Airman with a laptop, a cyber
  operator, and a B-2 at night. No generated imagery.
- Provenance registry [content/photography.ts](content/photography.ts)
  (photographer, date, location, release ID, rights, source link).
- [components/Photograph.tsx](components/Photograph.tsx) for responsive images and
  credit lines.
- New [Photography & sources](app/credits/page.tsx) page, linked from the footer.

#### Shared system
- Self-hosted Libre Caslon Display and Text (SIL OFL), with license in
  [app/fonts/](app/fonts).
- Cinematic page header [components/PageHero.tsx](components/PageHero.tsx) for
  Tools, Plays, Comms, Learn, and Search, each with its own photograph or type
  only.
- New dark and brass design tokens, a twelve-column hairline "colonnade," and
  scroll-linked `.rise` and `.drift` motion utilities (CSS only; disabled for
  reduced motion).
- Dark institutional header and footer, including a footer statement
  ([components/SiteHeader.tsx](components/SiteHeader.tsx),
  [components/SiteFooter.tsx](components/SiteFooter.tsx),
  [lib/navigation.ts](lib/navigation.ts)).

#### Tests and tooling
- Playwright and axe-core with `npm run test:ui` ([playwright.config.ts](playwright.config.ts)).
  23 browser tests in [tests/ui/](tests/ui):
  - `home.spec.ts`: source provenance and non-endorsement, animation sequence and
    reduced motion, optional setup and saved items, reference tabs and source
    filters, route reachability, and accessibility at 1440, 1024, 768, and 390 px.
  - `tools.spec.ts`: search and task filters, tool detail, saved items and
    progress, clipboard, dialog focus, layout and accessibility at four widths,
    shared navigation.
  - `art-direction.spec.ts`: dark/light rhythm, photograph attribution and
    loading, and accessibility and overflow for every page header at 1440 and 390 px.

### Changed
- **Navigation:** the sidebar and bottom navigation were replaced by a shared
  header with a mobile menu (`components/BottomNav.tsx` removed). The labels and
  routes are kept.
- **Tools:** reworked into an editorial directory with a cinematic header,
  numbered categories, search combined with task filters, and visible
  verification dates ([app/tools/page.tsx](app/tools/page.tsx),
  [app/tools/tools.module.css](app/tools/tools.module.css)). Launch links,
  saved items, access steps, Coming Soon tools, M365 workflow, and OPSEC
  guidance are retained.
- **Home working reference:** Saved work, Strategy, and Sources are now
  keyboard-operable tabs with ruled layouts ([components/HomeSections.tsx](components/HomeSections.tsx),
  [components/HomeSections.module.css](components/HomeSections.module.css)).
  Strategy disclosure links are no longer nested inside buttons.
- **First visit:** setup is now optional and no longer covers the opening
  ([components/AppChrome.tsx](components/AppChrome.tsx)). **Set up Home** and
  **Change setup** remain.
- **Plays, Comms, Learn, Search:** new cinematic headers; the repeated Air Force
  insignia and blue heroes were removed.
- **Typography and layout:** pages are full-bleed scenes constrained to a 1280 px
  measure ([app/globals.css](app/globals.css), [app/layout.tsx](app/layout.tsx)).
- **Detail panels and report controls:** dialog focus handling, markup, and
  44 px targets improved ([components/ResponsiveDetailPanel.tsx](components/ResponsiveDetailPanel.tsx),
  [components/ReportAccessButton.tsx](components/ReportAccessButton.tsx),
  [components/PlatformAccount.tsx](components/PlatformAccount.tsx)).
- **Contrast:** legacy gray text tokens darkened (`gray-500` to `#566170`,
  `gray-400` to `#636c78`) so older page bodies pass AA contrast on the stone
  background.
- [lib/mock/tools.ts](lib/mock/tools.ts): documentation comments only.
- [README.md](README.md): documents the design system, photography workflow,
  leadership provenance, optional setup, and test coverage.
- `.gitignore`: ignores Playwright output.

### Removed
- `components/BottomNav.tsx`.
- An unsupported "CSAF-endorsed" claim in the strategy section.
- Repeated Air Force insignia and logo-led blue heroes.
- Obsolete Tools hero styles.

### Dependencies
- Added dev dependencies `@playwright/test` and `@axe-core/playwright`.
- No runtime dependency changes. The existing `npm audit` advisories (including
  Next.js 16.2.12) are unchanged and out of scope.

### Verification
- 23 of 23 browser tests pass, including axe accessibility checks at 1440, 1024,
  768, and 390 px.
- `npm run build:platform` and `npm run build:static` succeed.
- Exported site checked for console errors, failed requests, and horizontal
  overflow.

### Known limitations
- The bodies of Plays, Comms, and Learn still use the earlier card layout beneath
  their new headers.
- Photograph selection and signature use should be confirmed with Public Affairs.
- No CSAF portrait is used, to avoid implying endorsement.
- After editing `app/globals.css`, delete `.next` before running the dev server or
  tests, as stale styles can otherwise be served.
