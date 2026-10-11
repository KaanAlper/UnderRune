$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$runtimeLock = (Get-Content -LiteralPath (Join-Path $projectRoot 'tools-lock.json') -Raw | ConvertFrom-Json).officialRuntime
$runtimePath = Join-Path $projectRoot '.tools/gamemaker-html5'
if (-not (Test-Path -LiteralPath $runtimePath)) {
    New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot '.tools') | Out-Null
    git clone --no-checkout --depth 1 $runtimeLock.repository $runtimePath
    if ($LASTEXITCODE -ne 0) { throw 'Official runtime download failed' }
    git -C $runtimePath fetch --depth 1 origin $runtimeLock.revision
    if ($LASTEXITCODE -ne 0) { throw 'Pinned runtime revision download failed' }
    git -C $runtimePath checkout --detach $runtimeLock.revision
    if ($LASTEXITCODE -ne 0) { throw 'Pinned runtime checkout failed' }
}
$runtimeRevision = (git -C $runtimePath rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $runtimeRevision -ne $runtimeLock.revision) {
    throw 'Existing runtime checkout does not match tools-lock.json; it was left unchanged.'
}
node (Join-Path $PSScriptRoot 'build-official-runtime.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Official runtime bundle failed' }
