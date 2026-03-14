@echo off
echo Building and Running Neon Runner...

echo Checking for MongoDB...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo MongoDB not found. Please install MongoDB and ensure mongod is in PATH.
    echo The app will run without database functionality.
) else (
    echo Starting MongoDB...
    start mongod
)

echo Building frontend...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo Starting backend...
cd ../backend
npm start