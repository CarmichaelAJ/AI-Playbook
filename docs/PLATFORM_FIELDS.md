# Platform Fields Map

Prepared: 29 July 2026

This is the working field map for turning Airman's AI Playbook into a standalone app while keeping a static version easy to sell or deploy.

## User Profile

| Field | Purpose |
|---|---|
| `id` | Internal user id |
| `email` | Must pass approved government domain rules when auth is enabled |
| `display_name` | Name shown to the user |
| `rank` | Used for learning paths and comments |
| `afsc` | Used for communities, search, and learning paths |
| `unit` | Optional, useful for admin reporting and local champions |
| `role` | Viewer, contributor, moderator, admin |
| `home_preferences` | Tools, learning, saved plays, recent items |
| `created_at` | Account creation |
| `last_seen_at` | Login and usage freshness |

## Tool Submission

| Field | Purpose |
|---|---|
| `name` | Tool name |
| `url` | Launch or reference link |
| `description` | What it does |
| `problem_solved` | Why an Airman would use it |
| `approved_for` | Public, official use, CUI, IL4, IL5, TBD |
| `not_approved_for` | Classified, PII, CUI, export-controlled, or other blocked use |
| `owner_org` | Who owns or sponsors it |
| `access_path` | How to get access |
| `cac_required` | Yes/no |
| `license_required` | Yes/no/details |
| `submitted_by` | User id or email |
| `status` | Pending, approved, rejected, needs review |
| `moderation_notes` | Admin notes |

## Community

| Field | Purpose |
|---|---|
| `name` | Community or AFSC group |
| `kind` | AFSC, role, office, mission area, working group |
| `aliases` | Search terms like 2A, 1D7, maintainer, cyber |
| `mission` | Short description |
| `common_work` | Tasks they do often |
| `starter_play_ids` | Plays to show first |
| `starter_tool_ids` | Tools to show first |
| `sme_contact` | Optional maintainer or reviewer |
| `validation_status` | Draft, SME reviewed, approved |

## Learning Asset

| Field | Purpose |
|---|---|
| `title` | Lesson or video title |
| `type` | Video, guide, checklist, course, path |
| `source` | First-party, YouTube, DAF365, vendor, other |
| `duration` | Time required |
| `level` | Beginner, working user, builder, admin |
| `afsc_tags` | Who it applies to |
| `rank_tags` | Rank-oriented learning path support |
| `tool_tags` | Related tools |
| `approved_for` | Data and access posture |
| `owner` | Content maintainer |

## Social Features

| Field | Purpose |
|---|---|
| `post_type` | Tool, play, lesson, question, update |
| `title` | Submission headline |
| `body` | Details or comment |
| `author_rank` | Display context |
| `author_afsc` | Display context |
| `votes` | Score or helpfulness |
| `comment_count` | Activity count |
| `status` | Visible, hidden, flagged, archived |
| `moderation_reason` | Why something was hidden or flagged |

## Admin And Feature Flags

| Field | Purpose |
|---|---|
| `feature_id` | Stable key |
| `enabled` | On/off |
| `mode` | Static, local-only, platform |
| `requires_auth` | Yes/no |
| `requires_database` | Yes/no |
| `requires_moderation` | Yes/no |
| `static_fallback` | What users see when disabled |
| `owner` | Who can change it |
| `changed_by` | Audit trail |
| `changed_at` | Audit trail |

## Analytics

| Field | Purpose |
|---|---|
| `event_name` | Viewed tool, searched, submitted tool, completed lesson |
| `user_role` | Viewer/contributor/admin, avoid collecting more than needed |
| `afsc` | Optional aggregate dimension |
| `rank_band` | Optional aggregate dimension |
| `feature_id` | Feature tied to event |
| `content_id` | Play, tool, lesson, or community |
| `created_at` | Timestamp |

## Audit Log

| Field | Purpose |
|---|---|
| `actor_id` | User who did it |
| `action` | Create, update, approve, reject, hide, toggle |
| `target_type` | Tool, play, feature, comment, user |
| `target_id` | Record changed |
| `before` | Optional previous state |
| `after` | Optional new state |
| `created_at` | Timestamp |

## Build Priority

1. Users and auth session.
2. Feature flags and admin settings.
3. Tool submissions and moderation queue.
4. Communities and AFSC/rank learning paths.
5. First-party videos and learning assets.
6. Voting, comments, and Reddit-like discovery.
7. Analytics and audit logs.
8. Messaging only if the team decides it is worth the sustainment burden.
