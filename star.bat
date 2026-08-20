@echo off
setlocal

cd /d "%~dp0"
title Portfolio

set "PORT=3000"
if not "%~1"=="" set "PORT=%~1"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found.
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found.
  echo Reinstall Node.js with npm enabled, then run this file again.
  pause
  exit /b 1
)

if not exist package.json (
  echo [ERROR] package.json not found.
  echo Run this file from project root.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  if exist package-lock.json (
    call npm ci
  ) else (
    call npm install
  )

  if errorlevel 1 (
    echo [ERROR] Dependency install failed.
    pause
    exit /b 1
  )
)

echo Starting portfolio...
echo URL: http://localhost:%PORT%
echo.

call npm run dev -- -p %PORT%

echo.
echo Server stopped.
pause
