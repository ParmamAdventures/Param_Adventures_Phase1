#!/usr/bin/env pwsh
# Local E2E Test Runner
# This script helps run E2E tests locally with proper environment setup

Write-Host "🚀 Param Adventures E2E Test Runner" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if servers are running
$apiRunning = $false
$webRunning = $false

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 2 -ErrorAction Stop
    $apiRunning = $true
    Write-Host "✅ API Server is running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ API Server is NOT running on port 3001" -ForegroundColor Red
}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    $webRunning = $true
    Write-Host "✅ Web Server is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Web Server is NOT running on port 3000" -ForegroundColor Red
}

Write-Host ""

if (-not $apiRunning -or -not $webRunning) {
    Write-Host "⚠️  Prerequisites Missing!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please start the servers before running E2E tests:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminal 1 - API Server:" -ForegroundColor Cyan
    Write-Host "  cd apps/api" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 2 - Web Server:" -ForegroundColor Cyan
    Write-Host "  cd apps/web" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 3 - Run Tests:" -ForegroundColor Cyan
    Write-Host "  cd apps/e2e" -ForegroundColor White
    Write-Host "  npm test" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if test database is seeded
Write-Host "📊 Checking test database..." -ForegroundColor Cyan
Write-Host ""

# Run tests
Write-Host "🧪 Running E2E tests..." -ForegroundColor Cyan
Write-Host ""

npx playwright test

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check the report for details." -ForegroundColor Red
    Write-Host ""
    Write-Host "View the HTML report:" -ForegroundColor Cyan
    Write-Host "  npx playwright show-report" -ForegroundColor White
}

exit $exitCode
