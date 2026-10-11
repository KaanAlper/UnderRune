# Prepares original-code battles from the local DELTARUNE install (run after npm run prepare:game).
# Reads the installed game only; every generated file stays under extracted/, public/generated/ and .tools/.
param([switch]$SkipEngine)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
$project = Split-Path $PSScriptRoot -Parent
$lock = Get-Content -LiteralPath (Join-Path $project 'tools-lock.json') -Raw | ConvertFrom-Json
$game = if ($env:DELTARUNE_DIR) { $env:DELTARUNE_DIR } else { 'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE' }
$cli = Join-Path $project '.tools/utmt-0.9.2.0/UndertaleModCli.exe'
if (!(Test-Path -LiteralPath $cli)) { throw 'UndertaleModTool CLI missing: run npm run prepare:game first.' }

# 1. Room layouts (party evidence) per chapter.
$priorExport = $env:LL_EXPORT_DIR
try {
    foreach ($chapter in 1..5) {
        $env:LL_EXPORT_DIR = Join-Path $project "extracted/chapter${chapter}_windows"
        # Empty stdin: some terminals otherwise leave the CLI waiting for input.
        $null | & $cli load (Join-Path $game "chapter${chapter}_windows/data.win") --scripts (Join-Path $PSScriptRoot 'utmt/export-room-layout.csx')
        if ($LASTEXITCODE -ne 0) { throw "Room layout export failed for chapter $chapter" }
    }
} finally { $env:LL_EXPORT_DIR = $priorExport }

# 2. Battle calls, equipment catalog and party evidence.
foreach ($script in 'extract-battle-calls.mjs', 'build-equipment.mjs', 'derive-parties.mjs') {
    node (Join-Path $PSScriptRoot $script)
    if ($LASTEXITCODE -ne 0) { throw "$script failed" }
}

# 3. Pinned Butterscotch runtime and project-local Emscripten, then both browser engines.
if (!$SkipEngine) {
    $runtime = Join-Path $project '.tools/butterscotch'
    if (!(Test-Path -LiteralPath $runtime)) {
        git clone --no-checkout $lock.bytecodeRuntime.repository $runtime
        if ($LASTEXITCODE -ne 0) { throw 'Butterscotch download failed' }
        git -C $runtime checkout --detach $lock.bytecodeRuntime.revision
        if ($LASTEXITCODE -ne 0) { throw 'Pinned Butterscotch checkout failed' }
    }
    $sdk = Join-Path $project '.tools/emsdk'
    $sdkVersion = $lock.bytecodeRuntime.diagnosticBuild.emscriptenVersion
    if (!(Test-Path -LiteralPath (Join-Path $sdk 'upstream/emscripten'))) {
        if (!(Test-Path -LiteralPath $sdk)) {
            git clone https://github.com/emscripten-core/emsdk.git $sdk
            if ($LASTEXITCODE -ne 0) { throw 'emsdk download failed' }
        }
        # Installed and activated inside the project only; no user-wide environment changes.
        & cmd.exe /d /c ('set "MSYSTEM=" && set "SHELL=" && "{0}\emsdk.bat" install {1} && "{0}\emsdk.bat" activate {1}' -f $sdk, $sdkVersion)
        if ($LASTEXITCODE -ne 0) { throw 'Emscripten install failed' }
    }
    foreach ($portable in $false, $true) {
        if ($portable) { & (Join-Path $PSScriptRoot 'build-bytecode-browser.ps1') -Portable } else { & (Join-Path $PSScriptRoot 'build-bytecode-browser.ps1') }
    }
}

# 4. Per-chapter battle launchers (copies of data.win; the installed game is verified unchanged).
& (Join-Path $PSScriptRoot 'build-native-launchers.ps1')
Write-Output 'Native battles ready: npm run dev'
