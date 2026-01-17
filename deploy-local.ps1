# Local Deployment Script for Param Adventures
# This script automates the setup process

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Param Adventures - Local Deployment Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = Get-Location
$API_DIR = "$PROJECT_ROOT/apps/api"
$WEB_DIR = "$PROJECT_ROOT/apps/web"
$DOCKER_COMPOSE_FILE = "$PROJECT_ROOT/docker-compose.yml"

function Check-Command {
    param(
        [string]$CommandName,
        [string]$DisplayName
    )
    
    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        Write-Host "[OK] $DisplayName found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[ERROR] $DisplayName NOT found" -ForegroundColor Red
        Write-Host "   Please install $DisplayName to continue" -ForegroundColor Yellow
        return $false
    }
}

function Start-Infrastructure {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Starting Infrastructure (Docker)" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    Write-Host "Starting Docker containers..." -ForegroundColor Yellow
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Infrastructure started" -ForegroundColor Green
        Write-Host "   PostgreSQL: localhost:5433" -ForegroundColor Cyan
        Write-Host "   Redis: localhost:6379" -ForegroundColor Cyan
        
        # Wait for services to be ready
        Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        return $true
    } else {
        Write-Host "[ERROR] Failed to start infrastructure" -ForegroundColor Red
        return $false
    }
}

function Setup-Backend {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Setting up Backend (API)" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    Push-Location $API_DIR
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install --silent
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate --silent
    
    # Apply migrations
    Write-Host "Applying database migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database migrations applied" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Migration warning - continuing..." -ForegroundColor Yellow
    }
    
    Pop-Location
    return $true
}

function Seed-DummyData {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Seeding Dummy Data" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    Push-Location $API_DIR
    
    Write-Host "Creating dummy data..." -ForegroundColor Yellow
    npx ts-node scripts/seed-dummy-data.ts
    
    $result = $LASTEXITCODE
    
    Pop-Location
    return ($result -eq 0)
}

function Setup-Frontend {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Setting up Frontend (Web)" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    Push-Location $WEB_DIR
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install --silent
    
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Frontend build failed" -ForegroundColor Red
        Pop-Location
        return $false
    }
    
    Pop-Location
    return $true
}

function Show-Summary {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "SETUP COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Start API server (in terminal 1):" -ForegroundColor Yellow
    Write-Host "   cd apps/api" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start Frontend (in terminal 2):" -ForegroundColor Yellow
    Write-Host "   cd apps/web" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor Cyan
    Write-Host "   - Frontend:  http://localhost:3000" -ForegroundColor Green
    Write-Host "   - API:       http://localhost:3001" -ForegroundColor Green
    Write-Host "   - API Docs:  http://localhost:3001/api-docs" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test Credentials:" -ForegroundColor Cyan
    Write-Host "   - Admin:     admin@test.com / AdminPass123" -ForegroundColor White
    Write-Host "   - User:      user1@test.com / UserPass123" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host "   - Backend Guide:        docs/BACKEND_GUIDE.md" -ForegroundColor White
    Write-Host "   - Frontend Guide:       docs/FRONTEND_GUIDE.md" -ForegroundColor White
    Write-Host "   - Deployment Guide:     docs/DEPLOYMENT.md" -ForegroundColor White
    Write-Host "   - Troubleshooting:      docs/TROUBLESHOOTING.md" -ForegroundColor White
    Write-Host ""
    Write-Host "Database:" -ForegroundColor Cyan
    Write-Host "   - Type:       PostgreSQL (Docker)" -ForegroundColor White
    Write-Host "   - Host:       localhost:5433" -ForegroundColor White
    Write-Host "   - Database:   param_adventures" -ForegroundColor White
    Write-Host ""
}

function Show-Error {
    param([string]$Message)
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "SETUP FAILED" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $Message -ForegroundColor Yellow
    Write-Host ""
}

# Main Execution

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$allGood = (Check-Command "node" "Node.js") -and $allGood
$allGood = (Check-Command "npm" "npm") -and $allGood
$allGood = (Check-Command "docker" "Docker") -and $allGood

if (-not $allGood) {
    Show-Error "Missing required tools. Please install all prerequisites and try again."
    exit 1
}

Write-Host ""
Write-Host "[OK] All prerequisites found" -ForegroundColor Green

# Execute setup steps
if (-not (Start-Infrastructure)) {
    Show-Error "Failed to start infrastructure"
    exit 1
}

if (-not (Setup-Backend)) {
    Show-Error "Failed to setup backend"
    exit 1
}

if (-not (Seed-DummyData)) {
    Write-Host "[WARN] Dummy data seeding had issues, but setup continues..." -ForegroundColor Yellow
}

if (-not (Setup-Frontend)) {
    Show-Error "Failed to setup frontend"
    exit 1
}

Show-Summary
Write-Host "Setup complete!" -ForegroundColor Cyan
