# dev.ps1 — Start the Face Swap Live development environment on Windows 11
#
# Usage:
#   .\scripts\dev.ps1
#
# What it does:
#   1. Activates the server Python venv and starts uvicorn.
#   2. Prints the command to start the static web server in a second terminal.

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ServerDir = Join-Path $RepoRoot "apps\server"
$VenvActivate = Join-Path $ServerDir ".venv\Scripts\Activate.ps1"

Write-Host ""
Write-Host "=== Face Swap Live — Dev Server ===" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------------------
# Step 1: verify venv exists
# -----------------------------------------------------------------------
if (-not (Test-Path $VenvActivate)) {
    Write-Host "[INFO] Virtual environment not found. Creating it now..." -ForegroundColor Yellow
    Push-Location $ServerDir
    python -m venv .venv
    & $VenvActivate
    pip install -r requirements.txt
    Pop-Location
} else {
    & $VenvActivate
}

# -----------------------------------------------------------------------
# Step 2: print static-server instruction
# -----------------------------------------------------------------------
Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Open a SECOND terminal and run:" -ForegroundColor White
Write-Host ""
Write-Host "    cd `"$RepoRoot`"" -ForegroundColor Green
Write-Host "    python -m http.server 5173   # port 5173 is arbitrary; change if already in use" -ForegroundColor Green
Write-Host ""
Write-Host "  Then open in Chrome/Edge:" -ForegroundColor White
Write-Host "    http://localhost:5173/apps/web/index.html" -ForegroundColor Green
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# -----------------------------------------------------------------------
# Step 3: start uvicorn (blocks until Ctrl+C)
# -----------------------------------------------------------------------
Write-Host "[INFO] Starting uvicorn on http://0.0.0.0:8000 ..." -ForegroundColor Cyan
Write-Host "       Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

Push-Location $ServerDir
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
Pop-Location
