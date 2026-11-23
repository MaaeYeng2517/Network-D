@echo off
REM Network Course Platform - Windows Quick Start (Batch Version)
REM Double-click to run both servers

title Network Course Platform
color 0A

echo =========================================
echo Network Course Platform - Quick Start
echo =========================================
echo.

REM Get script directory
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo Project: %PROJECT_DIR%
echo.

REM Check if Python is available
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in PATH.
    echo Please run install-windows.ps1 first or install Python manually.
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found in PATH.
    echo Please run install-windows.ps1 first or install Node.js manually.
    pause
    exit /b 1
)

echo Starting Python iPerf3 Dashboard on port 8765...
start "iPerf3 Dashboard" cmd /k python server.py

REM Wait for Python server to start
timeout /t 3 /nobreak >nul

echo Starting Next.js Dev Server on port 3000...
start "Next.js Dev Server" cmd /k npm run dev

echo.
echo Both servers starting in separate windows!
echo.
echo Main app:        http://localhost:3000
echo iPerf3 Dashboard: http://localhost:8765
echo.
echo Close the terminal windows to stop the servers.
echo.
pause