@echo off
echo Starting Haleyora Dashboard Development Environment...
echo.

echo [1/3] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo [2/3] Installing frontend dependencies...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [3/3] Starting development servers...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start backend in background
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Development servers started!
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:5173
echo Database Test: http://localhost:5173/#/database-test
echo.
pause 