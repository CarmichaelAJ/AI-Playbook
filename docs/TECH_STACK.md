# Airman's AI Playbook Tech Stack

Prepared: 29 July 2026

## Product Editions

| Edition | Build setting | Runtime dependencies |
| --- | --- | --- |
| Static | `NEXT_PUBLIC_APP_MODE=static` | Nginx or any static web host |
| Platform | `NEXT_PUBLIC_APP_MODE=platform` | Web, API, Postgres, and identity provider |

The static edition contains approved content, search, communities, learning
paths, saved items, onboarding, and device-local preferences. It does not call
the platform API, expose account navigation, or package platform-only routes.

The platform edition adds identity, submissions, feeds, voting, comments,
moderation, analytics, media publishing, progress, messaging, and admin feature
controls.

## Selected Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Web application | Next.js 16, React 19, TypeScript | Responsive application and static export |
| Styling | Tailwind CSS 4, locally bundled Public Sans and Barlow Condensed | Shared responsive design system without build-time font downloads |
| Interface icons | Lucide React | Consistent application controls |
| API | Node.js 20, Fastify, TypeScript | Versioned HTTP service and authorization boundary |
| Validation | Zod | Request and domain validation |
| Authentication | Adapter boundary, JOSE | Mock `.mil` development identity and Entra JWT validation |
| Database | PostgreSQL 16 | Platform users, submissions, moderation, learning, media, messages, and audit data |
| Database access | `pg` with repository modules | Explicit SQL and replaceable persistence boundary |
| Web serving | Nginx | Static delivery, security headers, and platform API proxy |
| Containers | Docker Compose | Repeatable local and deployable service topology |
| Edge | Cloudflare Tunnel | Optional origin protection and public routing |
| Quality gates | ESLint, TypeScript, production builds, dependency audit | Build and supply-chain checks |

## Hosting and Authorization Considerations

The application is portable across container-capable environments, but
containerization does not create an authorization boundary. The selected host
must identify the authorizing official, inherited controls, domain and
certificate path, scanning, continuous monitoring, logging, backup, patching,
incident response, and production-entry evidence.

| Pathway | Intended use | Decision required |
| --- | --- | --- |
| Organizational static hosting | Public V1 bridge with no account, API, database, or CUI | Confirm organizational ownership, domain, public release, accessibility, monitoring, and support |
| AFTC IL2 MAG or CloudFit | Candidate Government boundary for the static release or controlled platform evaluation | Coordinate through the Government PM or COR; confirm inherited authorization, service scope, onboarding, and formal cost |
| Platform One | Candidate container platform with established security and delivery services | Obtain a formal estimate and list of included versus team-owned operations |
| Gemstone | Potential low-cost development, review, and marketplace pathway | Track readiness; do not treat as production hosting until CI/CD, security review, scanning, domain, and customer entry are operational |
| Other approved Government boundary | Preferred when the gaining organization can inherit controls and operations | Confirm authorization inheritance, tenancy, funding, and sustainment owner |
| Commercial bridge | Time-bounded fallback for the public static V1 | Keep the static boundary; move to an organizational account and define migration and exit criteria |

Static and platform options must be evaluated separately. Adding identity,
server-side collection, a database, messaging, analytics, or uploaded media
changes the privacy, records, security, and operational burden. A beta or
prototype label does not replace authorization or production-entry decisions.

Five-year planning must include recurring operations, not only compute:
vulnerability scanning and remediation, monitoring, logging, backups, patching,
incident response, content maintenance, accessibility, moderation, and
personnel. Discussion estimates are not formal quotes.

## Architecture Rules

1. Public content remains usable without identity.
2. Platform features fail closed when disabled.
3. Static builds do not make platform API requests.
4. Authentication remains behind an adapter.
5. Authorization is enforced by the API, not browser role labels.
6. Every platform feature has a documented static fallback.
7. Classified processing is unsupported unless a future authority and hosting
   decision explicitly changes that boundary.

## Build Commands

```bash
npm run build:static
npm run build:platform
docker compose -f docker-compose.static.yml up -d --build
docker compose up -d --build
```

Local URLs:

- Static container: `http://localhost:3003`
- Platform container: `http://localhost:3002`
- Platform API: `http://localhost:8080`
