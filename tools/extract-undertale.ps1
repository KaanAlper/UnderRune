# Read-only export of the installed UNDERTALE's sprite index and texture pages for the theater intro.
# Output: extracted/undertale/. The installed data.win hash is verified unchanged.
param([string]$GameDir = $env:UNDERTALE_DIR)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
if (-not $GameDir) { $GameDir = 'C:/Program Files (x86)/Steam/steamapps/common/Undertale' }
$project = Split-Path -Parent $PSScriptRoot
$source = Join-Path $GameDir 'data.win'
if (-not (Test-Path -LiteralPath $source)) { Write-Output "UNDERTALE not found at $GameDir; the theater uses its text fallback."; exit 0 }
$cli = Join-Path $project '.tools/utmt-0.9.2.0/UndertaleModCli.exe'
$output = Join-Path $project 'extracted/undertale'
New-Item -ItemType Directory -Force -Path $output | Out-Null
$before = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
$priorDir = $env:LL_EXPORT_DIR; $priorTextures = $env:LL_EXPORT_TEXTURES
try {
    $env:LL_EXPORT_DIR = $output; $env:LL_EXPORT_TEXTURES = '1'
    $null | & $cli load $source --scripts (Join-Path $PSScriptRoot 'utmt/export-index.csx')
    if ($LASTEXITCODE -ne 0) { throw 'UNDERTALE export failed' }
} finally { $env:LL_EXPORT_DIR = $priorDir; $env:LL_EXPORT_TEXTURES = $priorTextures }
if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $before) { throw 'UNDERTALE data.win changed' }
Write-Output "UNDERTALE exported to extracted/undertale (sha256 $($before.ToLower()))"
