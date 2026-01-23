# Deploy-Local.ps1
# Automates the local deployment of Param Adventures for verification

Write-Host "🚀 Starting Local Deployment Verification..." -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "🔍 Checking prerequisites..."
if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Docker Compose not found. Please install Docker Desktop."
    exit 1
}
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js not found."
    exit 1
}

# 2. Start Infrastructure
Write-Host "🐳 Starting Infrastructure (Postgres + Redis)..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 5 # Wait for DB to be ready

# 3. Setup API
Write-Host "⚙️ Setting up Backend (API)..." -ForegroundColor Yellow
cd apps/api
Write-Host "📦 Installing API dependencies..."
npm install

Write-Host "🗄️ Running Migrations..."
npx prisma generate
npx prisma migrate deploy

Write-Host "🌱 Seeding Database..."
$env:ADMIN_EMAIL = "admin@example.com"
$env:SEED_PASSWORD = "password123"
$env:ALLOW_PROD_SEED = "true"
$env:SEED_DEMO_DATA = "true"
npm run seed

# 4. Build Projects (Verify Buildability)
Write-Host "🔨 Verifying Backend Build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Backend Build Failed!"
    exit 1
}

cd ../../apps/web
Write-Host "⚙️ Setting up Frontend..." -ForegroundColor Yellow
Write-Host "📦 Installing Frontend dependencies..."
npm install

Write-Host "🔨 Verifying Frontend Build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Frontend Build Failed!"
    exit 1
}

Write-Host "✅ VERIFICATION SUCCESSFUL!" -ForegroundColor Green
Write-Host "Both apps build successfully. Database is migrated and seeded."
Write-Host "To run the app locally:"
Write-Host "  1. Backend: cd apps/api; npm run dev"
Write-Host "  2. Frontend: cd apps/web; npm run dev"
