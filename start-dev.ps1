Write-Host "Starting Haleyora Dashboard Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[2/3] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/3] Starting development servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Database Test: http://localhost:5173/#/database-test" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit" 