# Feature Roadmap And Mode Map

Prepared: 29 July 2026

Every feature must be able to ship in one of three modes:

| Mode | Meaning |
|---|---|
| Static | No login, no database, no server-side user collection |
| Local-only | User preferences stay in browser storage |
| Platform | Requires backend, auth, roles, moderation, storage, or analytics approval |

## Static First

| Feature | Mode | Why |
|---|---|---|
| Home search entry | Static | Uses public content index |
| Global search page | Static | Searches plays, tools, sources, communities, and learning paths |
| Plays library | Static | Approved public guidance and templates |
| Tool directory | Static | Approved tool cards and access paths |
| Source library | Static | Official references and translated summaries |
| Source communities | Static | AFSC and role discovery without accounts |
| AFSC learning paths | Static | Curated paths can ship before auth exists |
| Data handling labels | Static | Tool and content safety labels can be editorial |
| Static feature map | Static | Shows build options without admin backend |

## Local-Only

| Feature | Mode | Why |
|---|---|---|
| First-run onboarding | Local-only | Helps route users without collecting identity |
| Custom HQ setup | Local-only | Saves preferences on the device |
| Saved plays and tools | Local-only | Useful without a backend |
| Recent items | Local-only | Helps navigation, no server collection needed |
| Personalized learning from local profile | Local-only | Can recommend paths from local AFSC/rank choices |
| Settings page for local preferences | Local-only | Static builds can still feel personal |

## Platform

| Feature | Mode | Why |
|---|---|---|
| .mil sign-in | Platform | Requires identity provider and policy approval |
| Microsoft Entra auth | Platform | Tenant, app registration, roles, and token validation |
| Admin console | Platform | Needs roles and protected routes |
| Runtime feature toggles | Platform | Needs trusted admin write path |
| Tool submissions | Platform | Needs auth, database, moderation, and audit trail |
| Submission review queue | Platform | Needs moderator/admin roles |
| Voting | Platform | Needs identity, rate limits, and abuse handling |
| Comments | Platform | Needs identity, moderation, and audit trail |
| First-party video hosting | Platform | Needs storage, publishing workflow, and access controls |
| Learning completion tracking | Platform | Needs user records and privacy review |
| Analytics for deployer/admin roles | Platform | Needs event model and collection approval |
| Messaging | Platform | Needs identity, notification rules, retention policy, and moderation |

## Recommended Build Order

1. Keep static app strong: Home search, communities, learning paths, plays, tools.
2. Add local-only settings and HQ personalization.
3. Add backend feature registry and admin read-only page.
4. Add `.mil` auth adapter with mock mode, then Entra mode.
5. Replace Google Form with platform tool submissions.
6. Add moderation queue and audit events.
7. Add first-party learning/video pipeline.
8. Add voting and comments only after moderation exists.
9. Add analytics after privacy and event review.
10. Add messaging last, if the sustainment burden is worth it.

## Current Decision

Learning by AFSC starts as static. The app can show useful curated cards today. Later, once users can sign in or set local preferences, the same path data can become personalized without changing the public content model.
