param([switch]$Portable)
$ErrorActionPreference = 'Stop'
# npm can inherit a PowerShell 7 module path when launching Windows PowerShell.
# Load this process's own module so Get-FileHash works in both shells.
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
$projectRoot = Split-Path -Parent $PSScriptRoot
$lock = Get-Content -LiteralPath (Join-Path $projectRoot 'tools-lock.json') -Raw | ConvertFrom-Json
$sourcePath = Join-Path $projectRoot '.tools/butterscotch-browser-source'
$pristinePath = Join-Path $projectRoot '.tools/butterscotch'
$sdkPath = Join-Path $projectRoot '.tools/emsdk'
$patchPath = Join-Path $projectRoot 'runtime/patches/browser-compat.patch'
$buildName = if ($Portable) { 'butterscotch-portable-build' } else { 'butterscotch-browser-current-build' }
$buildPath = Join-Path $projectRoot ".tools/$buildName"
$patchHash = (Get-FileHash -LiteralPath $patchPath -Algorithm SHA256).Hash.ToLower()
if ($patchHash -ne $lock.bytecodeRuntime.browserBuild.patchSha256) { throw 'Browser compatibility patch does not match tools-lock.json.' }
if (!(Test-Path -LiteralPath $sourcePath)) {
    & git clone --no-hardlinks --no-checkout $pristinePath $sourcePath
    if ($LASTEXITCODE -ne 0) { throw 'Runtime source clone failed.' }
    & git -C $sourcePath checkout --detach $lock.bytecodeRuntime.revision
    if ($LASTEXITCODE -ne 0) { throw 'Pinned runtime checkout failed.' }
    & git -C $sourcePath apply --check $patchPath
    if ($LASTEXITCODE -ne 0) { throw 'Patch does not apply to the pinned source.' }
    & git -C $sourcePath apply $patchPath
    if ($LASTEXITCODE -ne 0) { throw 'Patch application failed.' }
    & git -C $sourcePath add -N src/browser_audio_spatial.h
    if ($LASTEXITCODE -ne 0) { throw 'Patch indexing failed.' }
}
$revision = (& git -C $sourcePath rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $revision -ne $lock.bytecodeRuntime.revision) { throw 'Unexpected runtime revision.' }
$actualPatchPath = Join-Path $projectRoot '.tools/browser-applied.patch'
& git -C $sourcePath diff --binary "--output=$actualPatchPath"
if ($LASTEXITCODE -ne 0 -or (Get-FileHash -LiteralPath $actualPatchPath -Algorithm SHA256).Hash.ToLower() -ne $patchHash) {
    throw 'Runtime source has changes other than the reviewed patch. Preserve them and use a fresh source directory.'
}
if (& git -C $sourcePath ls-files --others --exclude-standard) { throw 'Unexpected untracked runtime files.' }
$sdkVersion = $lock.bytecodeRuntime.diagnosticBuild.emscriptenVersion
$sdkTags = Get-Content -LiteralPath (Join-Path $sdkPath 'emscripten-releases-tags.json') -Raw | ConvertFrom-Json
if ($sdkTags.releases.PSObject.Properties[$sdkVersion].Value -ne $lock.bytecodeRuntime.diagnosticBuild.emscriptenReleaseHash) { throw 'Unexpected Emscripten release.' }
$portableValue = if ($Portable) { 'ON' } else { 'OFF' }
# MSYS/Git Bash variables make emsdk_env.bat print POSIX exports that cmd ignores; clear them for this child only.
$configure = 'set "MSYSTEM=" && set "SHELL=" && call "{0}\emsdk_env.bat" >nul 2>&1 && emcmake cmake -S "{1}" -B "{2}" -G Ninja -DPLATFORM=web -DBACKEND=web -DCMAKE_BUILD_TYPE=Release -DENABLE_VM_STUB_LOGS=ON -DENABLE_VM_EXCEPTIONS_LOGS=ON -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=ON -DBROWSER_PORTABLE={3} -DBUTTERSCOTCH_COMMIT_HASH={4} && cmake --build "{2}" --parallel 2' -f $sdkPath, $sourcePath, $buildPath, $portableValue, $revision
& cmd.exe /d /c $configure
if ($LASTEXITCODE -ne 0) { throw 'Browser runtime build failed.' }
$artifacts = @('butterscotch.mjs', 'butterscotch.wasm') | ForEach-Object {
    $artifactPath = Join-Path $buildPath $_
    [ordered]@{ name = $_; sha256 = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToLower(); bytes = (Get-Item -LiteralPath $artifactPath).Length }
}
[ordered]@{ revision = $revision; patchSha256 = $patchHash; emscriptenVersion = $sdkVersion; portable = [bool]$Portable; stubLogs = $true; exceptionLogs = $true; artifacts = @($artifacts) } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $buildPath 'browser-manifest.json') -Encoding UTF8
Copy-Item -LiteralPath (Join-Path $sourcePath 'LICENSE') -Destination (Join-Path $buildPath 'LICENSE')
Write-Output 'Patched browser runtime built. Game parity still requires verification.'
