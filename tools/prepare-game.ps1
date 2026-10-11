$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'extract.ps1')
# Preserve all source events, including draw, inherited and shared scripts.
& (Join-Path $PSScriptRoot 'extract.ps1') -CodePattern '.'
node (Join-Path $PSScriptRoot 'audit-source.mjs')
if($LASTEXITCODE -ne 0){throw 'Source integrity audit failed'}
node (Join-Path $PSScriptRoot 'catalog.mjs')
if($LASTEXITCODE -ne 0){throw 'Inventory failed'}
& (Join-Path $PSScriptRoot 'extract-undertale.ps1')
node (Join-Path $PSScriptRoot 'build-assets.mjs')
if($LASTEXITCODE -ne 0){throw 'Asset build failed'}
node (Join-Path $PSScriptRoot 'build-source-ports.mjs')
if($LASTEXITCODE -ne 0){throw 'Source constants build failed'}
& (Join-Path $PSScriptRoot 'setup-runtime.ps1')
