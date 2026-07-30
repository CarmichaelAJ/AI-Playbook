# Owner Decisions Before Operational Release

Prepared for: CMSAF AI Action Team, PFTU 26-3.2

Engineering can prepare the options and enforce the selected rules. The
accountable owner must decide the items below before an operational release.

| Decision | Recommended V1 position | Owner input required |
| --- | --- | --- |
| Release edition | Use the platform edition for the controlled pilot and retain the static edition as the no-account fallback | Approve the launch edition and fallback trigger |
| Public front door | Allow public viewing of cleared Core content; require `.mil` identity for submissions, votes, comments, learning progress, messaging, and administration | Confirm public affairs and security posture |
| Entra roles | Map `User`, `Moderator`, `Admin`, and `Deployer` app roles; keep authorization in the API | Provide tenant IDs, app registrations, role assignees, and break-glass procedure |
| Data labels | Use approved public, IL2, IL4, and IL5 labels only after the hosting and content authorities validate those terms | Name the classification and hosting authority |
| Messaging | Keep behind a feature flag until retention, reporting, acceptable-use, and notification policies are approved | Decide whether direct messaging ships in V1 |
| Content authority | Assign one accountable owner and at least two moderators for each pilot community | Name personnel and coverage expectations |
| Content lifecycle | Require authority source, verification date, review date, and retirement action for governed content | Approve review intervals by content type |
| Media storage | Use approved object storage in production; local persistent volume is for development and demonstrations | Select production storage, scanning, captions, and retention controls |
| Notifications | Start with in-app notifications; add email or Teams only after an approved communications and privacy review | Approve channels and frequency limits |
| Analytics | Retain aggregate mission metrics and minimize user-level event retention | Approve measures, retention period, access, and privacy notice |
| Records and privacy | Treat messages, submissions, comments, reports, and audit events according to an approved schedule | Provide records schedule and privacy determination |
| Release authority | Require accessibility, security, abuse, privacy, and operational readiness findings to be dispositioned | Name the final release authority and acceptance evidence |

## External Inputs

- Microsoft Entra tenant, web/API registrations, redirect URIs, application
  roles, group assignments, and certificate or secret handling method.
- Approved hosting boundary, domain, TLS, WAF, logging, vulnerability scanning,
  backup destination, and disaster-recovery objectives.
- Section 508 assessment and remediation disposition.
- Public affairs, security, privacy, records, and content-release determinations.
- Pilot AFSCs, content owners, moderators, testers, measures, and end date.

The repository defaults remain conservative: platform-only capabilities are
feature controlled, authorization is enforced in the API, and the static build
does not contain platform routes.
