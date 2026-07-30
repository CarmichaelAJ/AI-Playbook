param(
  [string]$OutputDirectory = ".backups"
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$targetDirectory = [System.IO.Path]::GetFullPath((Join-Path $root $OutputDirectory))

if (-not $targetDirectory.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Backup output must remain inside the repository workspace."
}

New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $targetDirectory "airman-playbook-$stamp.dump"
$containerTarget = "/tmp/airman-playbook-backup.dump"

docker compose exec -T db pg_dump -U airman_playbook -d airman_playbook -Fc --file $containerTarget
if ($LASTEXITCODE -ne 0) {
  throw "Postgres backup failed."
}

docker compose cp "db:$containerTarget" $target
if ($LASTEXITCODE -ne 0) {
  throw "Could not copy the Postgres backup from the database container."
}

Write-Output $target
