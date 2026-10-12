# Prepares faithful browser battles after npm run prepare:game; no native runtime is needed.
# Reads the installed game without saving it. Generated metadata/assets stay inside this project.
param([Alias('game-dir')][string]$GameDir = $env:DELTARUNE_DIR)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
$project = Split-Path -Parent $PSScriptRoot
$lock = Get-Content -LiteralPath (Join-Path $project 'tools-lock.json') -Raw | ConvertFrom-Json
if ($lock.version -notmatch '^\d+\.\d+\.\d+\.\d+$') { throw 'Invalid pinned UndertaleModTool version in tools-lock.json.' }
$cli = Join-Path $project ('.tools/utmt-' + $lock.version + '/UndertaleModCli.exe')
if (!(Test-Path -LiteralPath $cli)) { throw 'Pinned UndertaleModTool CLI missing: run npm run prepare:game first.' }
if (!$GameDir) { $GameDir = 'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE' }
$source = Join-Path $GameDir 'chapter1_windows/data.win'
$output = Join-Path $project 'extracted/chapter1_windows'
if (!(Test-Path -LiteralPath $source)) { throw 'Chapter 1 data.win was not found. Set DELTARUNE_DIR or pass -GameDir.' }
if (!(Test-Path -LiteralPath (Join-Path $output 'index.json'))) { throw 'Extracted sprite index missing: run npm run prepare:game first.' }
# Equipment uses every chapter's extracted scripts so unavailable encounters can still offer preparation.
foreach ($chapter in 1..5) {
    foreach ($script in 'scr_weaponinfo', 'scr_armorinfo', 'scr_iteminfo') {
        $code = Join-Path $project "extracted/chapter${chapter}_windows/code/gml_GlobalScript_${script}.gml"
        if (!(Test-Path -LiteralPath $code)) { throw "Equipment source missing ($script, chapter $chapter): run npm run prepare:game first." }
    }
}
$before = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
$priorExport = $env:LL_EXPORT_DIR
$priorGame = $env:DELTARUNE_DIR
try {
    $env:LL_EXPORT_DIR = $output
    $env:DELTARUNE_DIR = $GameDir
    # No --output/save option: the exporter only writes project-local sprites.json.
    $null | & $cli load $source --scripts (Join-Path $PSScriptRoot 'utmt/export-sprites.csx')
    if ($LASTEXITCODE -ne 0) { throw 'Read-only Chapter 1 sprite metadata export failed.' }
    foreach ($script in 'build-equipment.mjs', 'build-remake-assets.mjs') {
        node (Join-Path $PSScriptRoot $script)
        if ($LASTEXITCODE -ne 0) { throw "$script failed." }
    }
} finally {
    $env:LL_EXPORT_DIR = $priorExport
    $env:DELTARUNE_DIR = $priorGame
    $after = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
    if ($before -ne $after) { throw 'Installed Chapter 1 data.win hash changed.' }
    Write-Output "Installed Chapter 1 SHA256 unchanged: $after"
}
Write-Output 'Source browser battles ready: npm run dev (restart an existing dev server after regenerating assets).'
