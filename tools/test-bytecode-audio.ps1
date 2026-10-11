$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    # Match the runtime's 1 MiB stack: miniaudio PCM processing exceeds 64 KiB.
    & cmd.exe /d /c 'call .tools\emsdk\emsdk_env.bat >nul 2>&1 && emcc tests/runtime/spatial-audio.c -I .tools/butterscotch-browser-source/vendor/miniaudio -I .tools/butterscotch-browser-source/src -O2 -sENVIRONMENT=node -sASSERTIONS=1 -sSTACK_SIZE=1048576 -o .tools/source-probe/spatial-audio.cjs && node .tools/source-probe/spatial-audio.cjs'
    if ($LASTEXITCODE -ne 0) { throw 'Spatial audio regression test failed.' }
} finally { Pop-Location }
