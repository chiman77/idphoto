@echo off
chcp 65001 >nul
title 证件照生成器

echo ========================================
echo   证件照生成器 - ID Photo Generator
echo   一体制启动脚本
echo ========================================
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python ^(需 3.10+^)
    echo 请从 https://www.python.org/downloads/ 下载安装
    pause
    exit /b 1
)

:: Check Node.js (only needed for first build)
if not exist "frontend\dist\index.html" (
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo [错误] 首次运行需要 Node.js 来构建前端
        echo 请从 https://nodejs.org/ 下载安装
        pause
        exit /b 1
    )
    echo [1/3] 安装前端依赖...
    cd frontend
    call npm install
    cd ..
    echo [2/3] 构建前端...
    cd frontend
    call npx vite build
    cd ..
)

echo [1/2] 检查后端依赖...
python -c "import fastapi, uvicorn, rembg" >nul 2>&1
if %errorlevel% neq 0 (
    echo [安装] 安装后端依赖...
    pip install -r backend\requirements.txt
)

echo [2/2] 启动服务...
echo.
echo 服务地址: http://localhost:3000
echo 按 Ctrl+C 停止服务
echo.

python start_server.py
if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，请检查依赖安装
    pause
)
