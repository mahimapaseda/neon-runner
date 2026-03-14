@echo off
echo Starting Neon Runner Site...
echo.

echo Installing backend dependencies...
pushd backend
npm install
if %errorlevel% neq 0 (
    echo Backend install failed!
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
popd

echo Installing frontend dependencies...
pushd frontend
npm install
if %errorlevel% neq 0 (
    echo Frontend install failed!
    pause
    exit /b 1
)

echo Building frontend for production...
npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo Starting frontend production server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run preview"
popd

echo.
echo Neon Runner is now running in production mode!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:4173 (or check the preview output)
echo.
pause