param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [switch]$ConfirmRestore
)

$ErrorActionPreference = "Stop"
if (-not $ConfirmRestore) {
  throw "Restore replaces platform database contents. Re-run with -ConfirmRestore after validating the target."
}

$resolved = (Resolve-Path -LiteralPath $BackupFile).Path
$containerTarget = "/tmp/airman-playbook-restore.dump"

docker compose cp $resolved "db:$containerTarget"
if ($LASTEXITCODE -ne 0) {
  throw "Could not copy the backup into the database container."
}

docker compose exec -T db pg_restore -U airman_playbook -d airman_playbook --clean --if-exists $containerTarget

if ($LASTEXITCODE -ne 0) {
  throw "Postgres restore failed."
}
