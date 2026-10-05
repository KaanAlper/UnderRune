$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$toolRoot=Join-Path $projectRoot '.tools/utmt-0.9.2.0'
New-Item -ItemType Directory -Path $toolRoot -Force | Out-Null
$archive=Join-Path $projectRoot '.tools/utmt.zip'
$url='https://github.com/UnderminersTeam/UndertaleModTool/releases/download/0.9.2.0/UTMT_CLI_v0.9.2.0-Windows.zip'
if(-not(Test-Path -LiteralPath $archive)){Invoke-WebRequest -Uri $url -OutFile $archive}
Expand-Archive -LiteralPath $archive -DestinationPath $toolRoot -Force
[pscustomobject]@{version='0.9.2.0';url=$url;sha256=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLower()} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot 'tools-lock.json') -Encoding utf8
