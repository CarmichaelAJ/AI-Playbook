# Containerized Platform Architecture

Prepared: 29 July 2026

## North Star

Airman's Playbook should run as either a static content app or a full platform app without rewriting the product. Every feature gets a clear switch, a static fallback, and a platform path.

## Containers

| Container | Purpose | Can Be Replaced |
|---|---|---|
| `web` | Static Next export served by Nginx | Yes, any static host can serve `out/` |
| `api` | Backend for auth, submissions, admin workflows, and feature flags | Yes, keep the HTTP contract stable |
| `db` | Postgres for platform data | Yes, repository layer can be changed |

The Nginx container proxies `/api/*` to the API container. That lets the frontend call relative URLs later and keeps the browser origin simple.

## Auth Boundary

Authentication is an adapter, not a hard dependency:

| Adapter | Use |
|---|---|
| `disabled` | Static demos, public launches, and content-only deployments |
| `mock-mil` | Local development using `x-user-email` and `x-user-roles` headers |
| `entra` | Microsoft Entra token validation once tenant, audience, and app roles are approved |

Required Entra environment values:

| Variable | Purpose |
|---|---|
| `ENTRA_TENANT_ID` | Tenant used for token issuer and signing keys |
| `ENTRA_AUDIENCE` | API application/client audience |
| `ENTRA_ISSUER` | Optional explicit issuer override |

## First Backend Features

| Endpoint | Purpose |
|---|---|
| `GET /health` | Container and dependency check |
| `GET /v1/features` | Runtime feature registry |
| `GET /v1/auth/session` | Current identity and role context |
| `POST /v1/tools/submissions` | Submit an AI tool for review |
| `GET /v1/admin/tools/submissions` | Moderator/admin pending queue |

## Feature Rule

Platform features should fail closed. If a feature is off, the API returns a clear `feature_disabled` response and a static fallback. The frontend should hide the feature by default and only show active platform surfaces when the registry allows it.

## Next Build Steps

1. Add a frontend API client that calls `/api/v1/features`.
2. Add a settings page backed by local-only settings first.
3. Add submit-tool UI that falls back to the existing Google Form when the platform feature is off.
4. Add admin console shell for feature registry, pending submissions, and content queues.
5. Replace `mock-mil` with Entra in a controlled environment once the tenant registration is ready.
