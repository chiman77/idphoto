@echo off
chcp 65001 >nul
title ID Photo Generator - Build Installer

echo ========================================
echo   ID Photo Generator - Build Installer
echo ========================================
echo.

cd /d "%~dp0"

:: Step 1: Check prerequisites
echo [1/5] Checking build environment...

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set pyver=%%i
echo   [OK] Python %pyver%

:: Check PyInstaller
python -m PyInstaller --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing PyInstaller...
    python -m pip install pyinstaller
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install PyInstaller
        pause
        exit /b 1
    )
) else (
    for /f %%i in ('python -m PyInstaller --version') do set pyiver=%%i
    echo   [OK] PyInstaller %pyiver%
)

:: Check Inno Setup
set ISCC_PATH=
if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set ISCC_PATH="%ProgramFiles%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set ISCC_PATH="%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if defined ISCC_PATH (
    echo   [OK] Inno Setup
) else (
    echo   [WARN] Inno Setup not found - installer will not be created
    echo   Download: https://jrsoftware.org/isdl.php
)

echo.

:: Step 2: Build frontend if needed
echo [2/5] Building frontend...
if exist "frontend\dist\index.html" (
    echo   [SKIP] Frontend already built
) else (
    if not exist "node_modules" (
        pushd frontend
        call npm install
        popd
    )
    pushd frontend
    call npx vite build
    popd
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend build failed
        pause
        exit /b 1
    )
)
echo.

:: Step 3: Build PyInstaller executable
echo [3/5] Building Python executable (this may take 2-3 minutes)...
if exist "dist\IDPhotoGenerator\IDPhotoGenerator.exe" (
    echo   [SKIP] Executable already exists
    echo   To rebuild, delete dist\IDPhotoGenerator and run again
    echo.
)
if not exist "dist\IDPhotoGenerator\IDPhotoGenerator.exe" (
    python -m PyInstaller build_package.spec
    if %errorlevel% neq 0 (
        echo [ERROR] PyInstaller build failed
        pause
        exit /b 1
    )
    echo   [OK] Executable built
)
echo.

:: Step 4: Create Inno Setup installer
echo [4/5] Creating installer...
if not defined ISCC_PATH (
    echo   [SKIP] Inno Setup not installed
    goto :skip_inno
)

if not exist "dist\IDPhotoGenerator\IDPhotoGenerator.exe" (
    echo   [ERROR] PyInstaller output not found. Run build first.
    goto :skip_inno
)

echo   Compiling installer (this may take 1-2 minutes)...
%ISCC_PATH% setup.iss
if %errorlevel% neq 0 (
    echo [ERROR] Installer compilation failed
    pause
    exit /b 1
)
echo   [OK] Installer created!
:skip_inno
echo.

:: Step 5: Summary
echo [5/5] Build complete!
echo.
echo ========================================
echo   Build Results
echo ========================================
echo.
if exist "dist\IDPhotoGenerator\IDPhotoGenerator.exe" (
    for /f "delims=" %%i in ('dir /b /-c "dist\IDPhotoGenerator\IDPhotoGenerator.exe"') do set exesize=%%~zi
    set /a exesizemb = exesize / 1048576
    echo   [OK] Portable: dist\IDPhotoGenerator\IDPhotoGenerator.exe
    echo        Run directly from this folder
)
echo.
if exist "installer\*.exe" (
    for %%f in (installer\*.exe) do (
        set /a installersize = %%~zf / 1048576
        echo   [OK] Installer: %%f
    )
    echo        Double-click to install on any Windows PC
)
echo.
echo   Quick start: Double-click dist\IDPhotoGenerator\IDPhotoGenerator.exe
echo   Browser: http://localhost:3000
echo.
pause
