# Platform Operations Runbook

## Health and readiness

- Web: `GET /healthz`
- API process: `GET /api/health`
- API and database readiness: `GET /api/ready`
- Admin operational counters: `GET /api/v1/admin/metrics`

Alert on sustained non-200 health responses, database readiness failures,
elevated open access reports, overdue content reviews, and repeated API errors.
Do not send request bodies, message text, tokens, or user profile details to
external monitoring.

## Backup

Run from the repository:

```powershell
.\scripts\backup-platform.ps1
```

Backups are written under `.backups` and should be moved to approved encrypted
storage according to the records and recovery policy. Media in the
`airman_playbook_media` volume must be backed up separately by the hosting
provider or object-storage lifecycle policy.

Test restoration in a nonproduction environment:

```powershell
.\scripts\restore-platform.ps1 -BackupFile .backups\<file>.dump -ConfirmRestore
```

Record the test date, operator, backup age, restore duration, and validation
result. A backup that has not been restored successfully is not considered
verified.

## Recovery priorities

1. Restore the static public edition if the platform cannot operate safely.
2. Restore Postgres and verify `/api/ready`.
3. Restore media and validate captions and playback.
4. Verify Entra role enforcement and feature overrides.
5. Review audit events and reopen user access.

## Retention decisions required

The owning organization must approve retention for submissions, comments,
messages, notifications, analytics events, access reports, media, and audit
events before production launch.
