# Run Neon Runner Site
Write-Host "Starting Neon Runner Site..." -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Job -ScriptBlock { Set-Location $using:PWD\backend; npm run dev } -Name "BackendServer"
Set-Location ..

# Frontend
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Building frontend for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting frontend production server..." -ForegroundColor Yellow
Start-Job -ScriptBlock { Set-Location $using:PWD\frontend; npm run preview } -Name "FrontendServer"
Set-Location ..

Write-Host ""
Write-Host "Neon Runner is now running in production mode!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4173" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit (servers will continue running)"