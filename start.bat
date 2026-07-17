@echo off
chcp 65001 >nul
title 证件照生成器

echo ========================================
echo   证件照生成器 - ID Photo Generator
echo ========================================
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python ^(需 3.10+^)
    pause
    exit /b 1
)

:: Build frontend if needed
if not exist "frontend\dist\index.html" (
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo [错误] 首次运行需要 Node.js
        pause
        exit /b 1
    )
    echo [1/3] 安装前端依赖...
    pushd frontend
    call npm install
    popd
    echo [2/3] 构建前端...
    pushd frontend
    call npx vite build
    popd
)

echo [1/2] 检查后端依赖...
python -c "import fastapi, uvicorn, rembg" >nul 2>&1
if %errorlevel% neq 0 (
    echo [安装] 安装后端依赖 ^(首次需下载模型^)...
    pip install -r backend\requirements.txt
)

echo [2/2] 启动服务...
echo.

:: Kill any existing server on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: Start server in background
start "" /B python start_server.py

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Open browser
start "" http://localhost:3000

echo.
echo   ✅ 服务已启动！
echo   🌐 访问地址: http://localhost:3000
echo   ❌ 关闭本窗口或按 Ctrl+C 停止服务
echo.

:: Keep window open so user can close it to stop
pause
