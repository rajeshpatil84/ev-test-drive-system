@echo off
echo ==========================================
echo EV Test Drive Service - Setup Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js v14 or higher.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo Node.js found: %NODE_VERSION%
echo npm found: %NPM_VERSION%
echo.

REM Backend setup
echo ==========================================
echo Setting up Backend...
echo ==========================================
cd backend
echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    exit /b 1
)

echo Backend dependencies installed successfully
cd ..
echo.

REM Frontend setup
echo ==========================================
echo Setting up Frontend...
echo ==========================================
cd frontend
echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)

echo Frontend dependencies installed successfully
cd ..
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo 1. In one terminal, start the backend:
echo    cd backend ^&^& npm start
echo.
echo 2. In another terminal, start the frontend:
echo    cd frontend ^&^& npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause
