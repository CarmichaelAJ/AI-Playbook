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

## Handling

**Non-sensitive content only.** Nothing controlled or sensitive belongs in this repository.

> Working name; final title TBD.
