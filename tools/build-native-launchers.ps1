param([int[]]$Chapters=@(1,2,3,4,5))
$ErrorActionPreference='Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -Force
$project=Split-Path $PSScriptRoot -Parent
$game=if($env:DELTARUNE_DIR){$env:DELTARUNE_DIR}else{'C:/Program Files (x86)/Steam/steamapps/common/DELTARUNE'}
$destination=Join-Path $project '.tools/native-launchers'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$priorProject=$env:LL_NATIVE_PROJECT;$priorChapter=$env:LL_NATIVE_CHAPTER
try{
 $env:LL_NATIVE_PROJECT=$project
 foreach($chapter in $Chapters){
  if($chapter -lt 1 -or $chapter -gt 5){throw 'Invalid chapter'}
  $env:LL_NATIVE_CHAPTER=[string]$chapter
  $source=Join-Path $game "chapter${chapter}_windows/data.win"
  $before=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
  & (Join-Path $project '.tools/utmt-0.9.2.0/UndertaleModCli.exe') load $source --scripts (Join-Path $PSScriptRoot 'utmt/build-native-launcher.csx') --output (Join-Path $destination "chapter$chapter.win") --overwrite
  if($LASTEXITCODE -ne 0){throw "Chapter $chapter launcher build failed"}
  if((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $before){throw 'Source package changed'}
 }
}finally{$env:LL_NATIVE_PROJECT=$priorProject;$env:LL_NATIVE_CHAPTER=$priorChapter}
