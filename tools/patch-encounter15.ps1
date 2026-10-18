param(
    [switch]$Restore,
    [string]$GameDir = "C:\Program Files (x86)\Steam\steamapps\common\DELTARUNE"
)

$ErrorActionPreference = "Stop"

$chapter1Dir = Join-Path $GameDir "chapter1_windows"
$dataWin = Join-Path $chapter1Dir "data.win"
$dataBak = Join-Path $chapter1Dir "data.win.bak"
$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$projectDir = Split-Path $scriptDir -Parent
$utmtCli = Join-Path $projectDir "utmt-0.9.2.0\UndertaleModCli.exe"
$csxScript = Join-Path $scriptDir "enable_encounter15.csx"

if (-not (Test-Path $dataWin)) {
    Write-Error "Deltarune Chapter 1 data.win not found at: $dataWin"
    exit 1
}

if ($Restore) {
    if (Test-Path $dataBak) {
        Copy-Item -LiteralPath $dataBak -Destination $dataWin -Force
        Write-Host "[OK] Original data.win backup restored successfully!" -ForegroundColor Green
    } else {
        Write-Warning "Backup file ($dataBak) not found. File may already be original."
    }
    exit 0
}

# 1. Create a safe backup of the original data.win if not present
if (-not (Test-Path $dataBak)) {
    Write-Host "[INFO] Backing up original data.win -> data.win.bak" -ForegroundColor Cyan
    Copy-Item -LiteralPath $dataWin -Destination $dataBak -Force
}

# 2. Apply patch via UTMT CLI
Write-Host "[INFO] Applying Encounter 15 (Clover & Hathy) patch..." -ForegroundColor Yellow

& $utmtCli load $dataWin --scripts $csxScript --output $dataWin --overwrite

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Encounter 15 has been patched into DELTARUNE!" -ForegroundColor Green
    Write-Host "1. Launch DELTARUNE and enter Chapter 1." -ForegroundColor White
    Write-Host "2. Press 'F6' anywhere in the Dark World to trigger the battle instantly." -ForegroundColor White
    Write-Host "   (Or solve the Clover puzzle in the Field to trigger it in the story)." -ForegroundColor White
    Write-Host "3. To revert to the unmodded game, run: .\patch-encounter15.ps1 -Restore" -ForegroundColor Gray
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Error "Patching failed with exit code $LASTEXITCODE."
}
