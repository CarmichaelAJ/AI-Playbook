# Airman's AI Playbook

Public home for the **Airman's AI Playbook** and its associated team-facing deliverables. The app helps Airmen get acquainted with approved AI tools, learning paths, source communities, and practical plays.

This repository publishes finished product. Private working notes, meeting transcripts, and source context stay outside the public repo unless cleared for release.

## Layout

- `app/` - Next static frontend
- `components/` - shared UI
- `content/` - public content sources used by the frontend
- `deliverables/` - team-facing artifacts
- `handbook/` - Playbook source material
- `services/api/` - containerized backend for auth, feature flags, submissions, and admin workflows
- `docker-compose.yml` - local container stack: static web, API, and Postgres

## Container Stack

Static and platform modes are separated on purpose:

- `web` builds the Next app as static files and serves them with Nginx.
- `api` runs the backend service.
- `db` runs Postgres for submissions, admin queues, and future platform features.

Build either edition explicitly:

```bash
npm run build:static
npm run build:platform
```

For Vercel, `vercel.json` selects the static build and serves the generated
`out/` directory. Import `CarmichaelAJ/AI-Playbook` and select the branch to
publish. The static build excludes platform account, submission, moderation,
and messaging routes and does not require the API or database.

Run the standalone static container at http://localhost:3003:

```bash
docker compose -f docker-compose.static.yml up -d --build
```

Run the stack:

```bash
npm run container:up
```

Then open:

- Web: http://localhost:3002
- API health: http://localhost:8080/health
- API through web proxy: http://localhost:3002/api/health

Auth is adapter-based. Set `AUTH_PROVIDER=disabled`, `mock-mil`, or `entra` in `.env.container.example` or a deployment-specific env file. Entra values are environment-driven so Microsoft identity can be swapped in without rewriting feature code.

`mock-mil` is for local demonstrations only. It accepts simulated `.mil` identity and role headers from the frontend. Production defaults to disabled auth unless a provider is explicitly configured.

Platform routes:

- `/submit` - submit a Tool, Play, or Community for review
- `/moderation` - moderator/admin approval queue
- `/learn` - first-party learning catalog and progress
- `/messages` - direct `.mil` platform messaging
- `/admin` - feature, media, safety, user, analytics, and audit controls
- `Top`, `Trending`, and `Recent` - approved community content only
- `Core` - built-in AI Playbook catalog only

Community API routes live under `/v1/submissions`, `/v1/feed`, and `/v1/moderation`. Votes are unique per authenticated email, comments carry username/AFSC/rank attribution, and pending content never appears in public feeds.

Cloudflare Tunnel deployment guidance is in `docs/CLOUDFLARE_DEPLOYMENT.md`. The optional `edge` Compose profile keeps the API and database behind the web proxy.

Microsoft Entra registration, roles, validation, and cutover steps are in `docs/ENTRA_CUTOVER.md`.

The selected stack is in `docs/TECH_STACK.md`. Current engineering and
operational due-outs are tracked in `docs/DUE_OUT_TRACKER.md`.
Production operations are covered in `docs/OPERATIONS_RUNBOOK.md`. Decisions
that require an accountable owner are in `docs/OWNER_DECISIONS.md`, and the
engineering accessibility pass is in `docs/ACCESSIBILITY_CHECKLIST.md`.

For local API development:

```bash
cd services/api
npm install
npm run dev
```

## Interface and browser checks

The site is art-directed as an editorial, institutional experience rather
than an application. Each page is a sequence of full-bleed scenes that alternate
architectural darkness and light stone: a cinematic hero, a typographic
statement with a photographic plate, a dark feature, an interactive section,
and a closing statement. The header carries the Air Force symbol, **Search**,
**Sign in**, and a **Menu** button that opens a side menu (Communities, Tools,
Learn, and secondary pages). Plays are not a navigation item; they are browsed
inside Communities.

- **Typography** carries the monumental scale. Libre Caslon Display and Text
  (display and quotations) and Public Sans (interface) are self-hosted under the
  SIL Open Font License; see [app/fonts/](app/fonts). Nothing loads from a third
  party.
- **Geometry** replaces ornament: a twelve-column hairline "colonnade" over
  dark scenes, double rules, and strictly symmetrical, axial compositions.
  There are no literal columns, seals, or repeated insignia.
- **Dark scenes** use a CSS grade (gradient and navy multiply) over the
  photograph. Images are never edited; tone is adjusted only in CSS.
- **Motion** is restrained and optional: the identity resolve in the hero,
  a slow settle on the hero photograph, and scroll-linked
  reveals and photographic drift (`.rise`, `.drift` in
  [app/globals.css](app/globals.css)). Scroll-linked effects use CSS only and are
  disabled by `prefers-reduced-motion` and unsupported browsers, where all content
  is simply visible.
- [PageHero](components/PageHero.tsx) gives Tools, Communities, Learn, and
  Search the same cinematic header, each with its own photograph or none.

Shared tokens live in [app/globals.css](app/globals.css); home scenes in
[app/home.module.css](app/home.module.css); directory layout and interaction
styles in [app/tools/tools.module.css](app/tools/tools.module.css).

### Photography

Only authentic, public-domain photographs are used. No imagery is generated,
composited, or retouched. [content/photography.ts](content/photography.ts) is
the registry: each entry records the photographer, date, location, release ID,
rights statement, and a link to the original. The same data renders the public
[Photography & sources](app/credits/page.tsx) page and the credit line beside
every photograph.

Files in [public/assets/photography/](public/assets/photography) are resized
WebP renditions (1200 and 2400 pixels wide) of the originals, which remain at the
linked sources. To add a photograph: choose an official U.S. Air Force or other
public-domain image with a verifiable source; avoid ceremonial, memorial, or
sensitive subjects; add a registry entry; export `-1200.webp` and `-2400.webp`;
and use `<Photo id="…">`. Showing a photograph does not imply endorsement by the
people or units pictured. If no suitable authentic photograph exists, use no
image rather than a substitute.

### Home hero and leadership memorandum

The hero is the full-screen H1 plus four real routes: **Communities**, **Search**,
**Tools**, and **Sign in** ([components/HomeHero.tsx](components/HomeHero.tsx)).
None of them scroll within the page.

The Chief of Staff's first letter to the force (3 Nov 2025) is a quiet link in the hero, set beneath
the title: the signature in white ink, "First letter to the force", and the signer and date, behind a thin
brass rule ([components/LeadershipLetter.tsx](components/LeadershipLetter.tsx)). It opens the signed PDF in
the same tab. The page does not reproduce or reword the letter. The record, hash, and validation live in
[content/leadershipLetter.ts](content/leadershipLetter.ts). The source is `handbook/assets/CSAF_Letter.pdf`;
the PDF and the signature crop are in `public/assets/memo/`. The product owner approved showing the
signature. See [docs/MEMO_ASSET_STATUS.md](docs/MEMO_ASSET_STATUS.md).

First-visit setup is intentionally **optional**, so it no longer covers the
opening. **Set up Home** and **Change setup** retain the existing device-local
preferences workflow. Saved work, strategy disclosures, and the source library
remain available in **Your working reference**, with keyboard-operable tabs.

### Directory behavior and validation

Tools search covers names, descriptions, categories, badges, and mapped tasks.
Search and task selection combine to narrow results; selecting the active task
again clears it. **All tools** clears the task selection; **Reset filters**
clears both search and task selection. Tool details retain launch links,
device-local saved items and access progress, dated verification, reporting,
and safety guidance. Missing launch links and Coming Soon entries remain
explicitly unavailable. Desktop details use a keyboard-contained dialog;
smaller screens expand details inline.

To run the browser regression and accessibility checks:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:ui
```

The test runner starts a static-mode preview on `127.0.0.1:3100`, or reuses an
existing preview there outside CI. Keep that port in **static mode** when
reusing it. Tests cover search/filter combinations, all roster entries, saved
state, access paths, clipboard feedback, optional setup, reference tabs and
source filters. Home tests verify the four hero routes, removed notices, the
Air Force symbol, and the memorandum structure when one is installed.
Navigation tests drive the side menu by keyboard and pointer on desktop and
mobile; community tests cover the hierarchy, aliases, multi-community plays,
search, and the absence of a Plays page. `npm run test:unit` runs the
community-graph and memo validation tests alone.
Axe checks cover the directory and all three home reference views at 1440,
1024, 768, and 390 pixels. Screenshots and failure traces are written
to the ignored `test-results/` directory. These checks complement, rather than
replace, a rendered visual review and `npm run build:static` /
`npm run build:platform`. Backend-dependent platform actions still require the
container stack.

## Communities and plays

Plays exist only inside communities. Communities form a hierarchy from broad to
narrow (community, career field, AFSC, shredout, special duty, role, task
area) and a community may have several parents.

- [content/communities.ts](content/communities.ts): communities, aliases, task language.
- [content/playCommunities.ts](content/playCommunities.ts): which plays are in which
  communities (one play can be in many) and community-specific adaptations that
  point at a base play instead of copying it.
- [lib/communityGraph.ts](lib/communityGraph.ts): ancestors, descendants, play
  links, and `validateCommunityData`.
- [app/communities/](app/communities) and [components/CommunityDetail.tsx](components/CommunityDetail.tsx):
  the browse page and one static page per community.

The vocabulary is a working one pending SME review. It is **not** an
authoritative AFSC mapping. The old `/plays` URL redirects to `/communities` in
Nginx and on Vercel.

## Restricted content

Everything in this repository is public. The site is a static export, so
classification-based visibility cannot be enforced here. No access policy or
backend has been supplied; see
[docs/RESTRICTED_CONTENT_REQUIREMENTS.md](docs/RESTRICTED_CONTENT_REQUIREMENTS.md).
This application is not approved to process any classification level.

## Handling

**Non-sensitive content only.** Nothing controlled or sensitive belongs in this repository.

> Working name; final title TBD.
