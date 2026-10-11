$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
$projectRoot = Split-Path -Parent $PSScriptRoot
$lock = Get-Content -LiteralPath (Join-Path $projectRoot 'tools-lock.json') -Raw | ConvertFrom-Json
$sourcePath = Join-Path $projectRoot '.tools/butterscotch'
$sdkPath = Join-Path $projectRoot '.tools/emsdk'
$buildPath = Join-Path $projectRoot '.tools/butterscotch-diagnostic-build'
$revision = (& git -C $sourcePath rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $revision -ne $lock.bytecodeRuntime.revision) {
    throw 'Bytecode runtime source does not match tools-lock.json.'
}
if (& git -C $sourcePath status --porcelain --untracked-files=no) {
    throw 'The pinned runtime source has local changes.'
}
$sdkTags = Get-Content -LiteralPath (Join-Path $sdkPath 'emscripten-releases-tags.json') -Raw | ConvertFrom-Json
$sdkVersion = $lock.bytecodeRuntime.diagnosticBuild.emscriptenVersion
$releaseHash = $sdkTags.releases.PSObject.Properties[$sdkVersion].Value
if ($releaseHash -ne $lock.bytecodeRuntime.diagnosticBuild.emscriptenReleaseHash) {
    throw 'Emscripten release does not match tools-lock.json.'
}
if (!(Test-Path -LiteralPath (Join-Path $sdkPath 'upstream/emscripten/emcmake.py'))) {
    throw "Install the project-local SDK first: .tools/emsdk/emsdk install $sdkVersion and activate $sdkVersion."
}
# Environment changes are confined to this child shell; no permanent activation.
$configure = 'set "MSYSTEM=" && set "SHELL=" && call "{0}\emsdk_env.bat" >nul 2>&1 && emcmake cmake -S "{1}" -B "{2}" -G Ninja -DPLATFORM=web -DBACKEND=web -DCMAKE_BUILD_TYPE=Release -DENABLE_VM_STUB_LOGS=ON -DENABLE_VM_EXCEPTIONS_LOGS=ON -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=ON -DBUTTERSCOTCH_COMMIT_HASH={3} && cmake --build "{2}" --parallel 2' -f $sdkPath, $sourcePath, $buildPath, $revision
& cmd.exe /d /c $configure
if ($LASTEXITCODE -ne 0) { throw 'Diagnostic runtime build failed.' }
$artifacts = @('butterscotch.mjs', 'butterscotch.wasm') | ForEach-Object {
    $artifactPath = Join-Path $buildPath $_
    [ordered]@{ name = $_; sha256 = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToLower(); bytes = (Get-Item -LiteralPath $artifactPath).Length }
}
[ordered]@{ revision = $revision; emscriptenVersion = $sdkVersion; stubLogs = $true; exceptionLogs = $true; artifacts = @($artifacts) } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $buildPath 'diagnostic-manifest.json') -Encoding UTF8
Copy-Item -LiteralPath (Join-Path $sourcePath 'LICENSE') -Destination (Join-Path $buildPath 'LICENSE')
Write-Output 'Diagnostic build ready. This does not certify game compatibility.'
