# Airman's AI Playbook Due-Out Tracker

Prepared for: CMSAF AI Action Team, PFTU 26-3.2

Status values describe the current repository, not operational approval.
The source transition workplan is `Meeting Due-Outs and Transition Workplan.md`
in the project handoff folder.

## Transition Deliverables

| Meeting due out | Status | Remaining action |
| --- | --- | --- |
| Detailed tech stack | Complete | Use `docs/TECH_STACK.md` as the proposal annex baseline |
| One-page CDAO proposal | PowerPoint draft complete | Validate sponsor, exact ask, hosting preference, cost range, and release target in `CDAO Airman's Playbook One-Page Proposal DRAFT.pptx` in the private handoff folder |
| Supporting proposal annexes | Package register complete | Use `Sonny CDAO Package - Deliverables Register.md` in the private handoff folder to finish cost, hosting, sustainment, collaboration, beta, and risk annexes |
| Platform One quote | External | Rosa obtains formal estimate and included services |
| AFTC IL2 MAG inquiry | External | Rosa coordinates through the responsible Government PM or COR and obtains the authorization, service, onboarding, and cost response |
| Gemstone pathway | Watch item | Confirm CI/CD, security review, container scanning, marketplace, domain, customer onboarding, production status, and cost |
| Hosting options comparison | In progress | Compare organizational static hosting, AFTC IL2 MAG, Platform One, other approved Government boundaries, Gemstone readiness, and a time-bounded commercial bridge; price static and platform separately |
| Five-year ROM | Not started | Include hosting, migration, scanning, monitoring, patching, backups, content, moderation, accessibility, authorization support, and personnel; use formal quotes where available |
| Interim sustainment model | Not started | Define Pathfinder bridge and handoff to AI Integration Team |
| V1 scope and parking lot | In progress | Static and platform editions are separated; owner must approve launch edition |
| Beta and feedback plan | Not started | Set testers, feedback window, end date, intake path, and defect disposition method |
| Ontology and click-path review | In progress | Search and community paths exist; run Airman task-language testing |
| Local font bundling | Complete | Public Sans and Barlow Condensed are now repository assets |
| Organizational deployment account | External | Move bridge deployment off an individual account |
| PA/security-policy determination | External | Obtain before force-wide release |
| Section 508 assessment | Engineering baseline ready | Execute `docs/ACCESSIBILITY_CHECKLIST.md` with the supported assistive-technology matrix and disposition findings |
| Privacy determination or PIA basis | External | Confirm separately for static and platform editions |
| Owner decisions from Attachment 3 | Decision register ready | Adjudicate `docs/OWNER_DECISIONS.md` plus provenance, tagline, notice, evaluation approach, and shelf label |
| Commander's AI Handbook disposition | External | Gaining owner decides transfer scope |

| Due out | Status | Evidence or acceptance condition | Next action |
| --- | --- | --- | --- |
| Separate static and platform editions | Complete | Independent builds; static container has no API or database dependency | Confirm which edition is used for each demonstration |
| Responsive web application | Complete | Mobile bottom navigation and collapsible desktop sidebar tested | Add managed-device browser test matrix |
| Unified search | Enhanced MVP complete | Static catalog plus platform community results, acronym expansion, synonyms, and typo tolerance | Approve ranking rules and review no-result analytics |
| AFSC and role communities | MVP complete | Curated communities and platform community submissions | Assign community owners and moderator coverage |
| Reddit-style submissions | MVP complete | Tools, Plays, and Communities support review, votes, comments, and ranked feeds | Run abuse and moderation tabletop |
| First-party learning videos | Pipeline complete | Admin upload, captions, draft, publish, archive, playback, and progress flow | Select approved production object storage and publish initial Airmen-to-expert series |
| AFSC and rank learning paths | Static complete | Curated role paths available without identity | Approve path owners, prerequisites, and completion criteria |
| Admin and deployer analytics | MVP complete | Event totals and admin dashboard exist | Approve privacy notice, retention, and mission metrics |
| Direct messaging | MVP complete | `.mil` user conversations, unread state, and persistence | Decide retention, reporting, notifications, and whether messaging ships |
| User-customizable Home | Partial | Device-local onboarding, favorites, and recent context exist | Define allowed widgets and whether layouts sync across devices |
| Runtime feature controls | Complete | Admin feature overrides and API enforcement exist | Define production change authority and rollback procedure |
| Cloudflare edge deployment | Configuration ready | Tunnel profile and deployment guide exist | Provide domain, tunnel token, WAF policy, and approved environment |
| Microsoft Entra sign-in | Adapter ready | API validates issuer, audience, signature, roles, and `.mil` identity | Register web/API apps and provide tenant-approved values |
| Content and data governance | Engineering controls complete | Labels, lifecycle dates, authority links, verification, retirement, thread locks, reports, audit events, and feature fallbacks exist | Approve IL terminology, records schedule, privacy review, and content authority |
| Access and broken-link reporting | Complete | Platform reports enter the admin queue; static reports use the configured external intake | Assign response ownership and service targets |
| In-app notifications | Complete | Broadcasts, moderation outcomes, comments, and messages create persisted notifications | Approve retention and any external delivery channel |
| Backup and recovery tooling | Complete | Persistent database/media volumes, readiness probes, backup/restore scripts, and runbook exist | Select encrypted off-host destination and execute a scheduled restore exercise |
| Offline static edition | Complete | Service worker caches the static application shell and excludes platform APIs | Confirm managed-device cache policy |
| Pilot content package | Not started | Initial approved Tools, Plays, Communities, and learning media published | Name content leads and select first operational use cases |
| Operational red team | Not started | Threat, abuse, privacy, accessibility, and failure-mode findings dispositioned | Schedule technical and policy review before external pilot |

## Immediate Work Package

1. Select the first three AFSC communities for the pilot.
2. Name one content owner and at least two moderators per pilot community.
3. Produce the first three Airmen-to-expert videos and transcripts.
4. Approve the submission, moderation, messaging, and records policies.
5. Obtain formal AFTC IL2 MAG and Platform One inputs through the responsible
   Government channels, and document Gemstone readiness.
6. Obtain Cloudflare and Entra deployment inputs for the selected pathway.
7. Run accessibility, security, and abuse-case testing.
8. Define pilot measures: activation, useful search rate, completed lessons,
   approved contributions, moderation time, and repeat use.
