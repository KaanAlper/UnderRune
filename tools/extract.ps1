param([Alias('game-dir')][string]$GameDir = $env:DELTARUNE_DIR, [Alias('index-only')][switch]$IndexOnly, [string]$Chapter, [string]$CodePattern)
$ErrorActionPreference='Stop'
if (-not $GameDir) { $GameDir='C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE' }
$projectRoot = Split-Path -Parent $PSScriptRoot
$cliPath=Join-Path $projectRoot '.tools/utmt-0.9.2.0/UndertaleModCli.exe'
if (-not (Test-Path -LiteralPath $cliPath)) { & (Join-Path $PSScriptRoot 'setup-utmt.ps1') }
$packages=Get-ChildItem -LiteralPath $GameDir -Directory | Where-Object { $_.Name -match '^chapter\d+_windows$' -and (-not $Chapter -or $_.Name -eq $Chapter) }
if (-not $packages) { throw 'No chapter packages found' }
$records=@()
foreach ($package in $packages) {
 $source=Join-Path $package.FullName 'data.win'
 $before=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
 $output=Join-Path $projectRoot ('extracted/'+$package.Name)
 New-Item -ItemType Directory -Path $output -Force | Out-Null
 $oldOutput=$env:LL_EXPORT_DIR; $oldTexture=$env:LL_EXPORT_TEXTURES; $oldPattern=$env:LL_CODE_PATTERN
 try {
  $env:LL_EXPORT_DIR=$output
  $env:LL_EXPORT_TEXTURES=if($IndexOnly -or $CodePattern){'0'}else{'1'}
  $env:LL_CODE_PATTERN=$CodePattern
  $scriptPath=Join-Path $PSScriptRoot $(if($CodePattern){'utmt/export-code.csx'}else{'utmt/export-index.csx'})
  & $cliPath load $source --scripts $scriptPath
  if($LASTEXITCODE -ne 0){throw "Extraction failed: $($package.Name)"}
  $after=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
  if($before -ne $after){throw 'Source hash changed'}
  $records+=[pscustomobject]@{id=$package.Name;relativePath=$package.Name+'/data.win';sha256=$before.ToLower();bytes=(Get-Item -LiteralPath $source).Length;unchanged=$true}
 } finally {$env:LL_EXPORT_DIR=$oldOutput;$env:LL_EXPORT_TEXTURES=$oldTexture;$env:LL_CODE_PATTERN=$oldPattern}
}
if(-not $Chapter -and -not $CodePattern){$records | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'extracted/source-manifest.json') -Encoding utf8}
