# DigiTalent AI - Local Development Setup Script
# Run this script after cloning the repository

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  DigiTalent AI - Setup Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check prerequisites
$hasDotnet = Get-Command dotnet -ErrorAction SilentlyContinue
$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasDocker = Get-Command docker -ErrorAction SilentlyContinue

if (-not $hasDotnet) {
    Write-Host "[WARN] .NET SDK not found. Install from: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
} else {
    Write-Host "[OK] .NET SDK: $(dotnet --version)" -ForegroundColor Green
}

if (-not $hasNode) {
    Write-Host "[WARN] Node.js not found. Install from: https://nodejs.org/" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green
}

if (-not $hasDocker) {
    Write-Host "[WARN] Docker not found. Install from: https://docker.com/" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Docker: $(docker --version)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete! See README.md for instructions." -ForegroundColor Cyan
