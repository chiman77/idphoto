@echo off
chcp 65001 >nul
title ID Photo Generator

echo ========================================
echo   ID Photo Generator - 证件照生成器
echo ========================================
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

:: Build frontend if needed
if not exist "frontend\dist\index.html" (
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] First run requires Node.js to build frontend
        pause
        exit /b 1
    )
    echo [1/3] Installing frontend dependencies...
    pushd frontend
    call npm install
    popd
    echo [2/3] Building frontend...
    pushd frontend
    call npx vite build
    popd
)

echo [1/3] Checking backend dependencies...
python -c "import fastapi, uvicorn, rembg" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INSTALL] Installing backend dependencies...
    pip install -r backend\requirements.txt
)

echo [2/3] Starting server...
echo.

:: Kill any existing server on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: Start server in background
start "" /B python start_server.py

:: Wait for server to start
echo [3/3] Waiting for server...
timeout /t 3 /nobreak >nul

:: Open browser
start "" http://localhost:3000

echo.
echo   Server started!
echo   Open: http://localhost:3000
echo   Close this window to stop the server
echo.

pause