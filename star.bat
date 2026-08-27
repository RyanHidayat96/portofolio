@echo off
setlocal

cd /d "%~dp0"
title Portfolio

set "REQUESTED_PORT=3000"
if not "%~1"=="" set "REQUESTED_PORT=%~1"

set /a START_PORT=%REQUESTED_PORT% >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Invalid port: %REQUESTED_PORT%
  echo Usage: star.bat [port]
  pause
  exit /b 1
)

set /a END_PORT=START_PORT+20

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

set "PORT="
for /l %%P in (%START_PORT%,1,%END_PORT%) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=[System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners().Port; if ($ports -contains [int]%%P) { exit 1 } else { exit 0 }" >nul 2>nul
  if not errorlevel 1 (
    set "PORT=%%P"
    goto :port_found
  )
)

echo [ERROR] No free port found from %START_PORT% to %END_PORT%.
echo Close another dev server or run: star.bat 3021
pause
exit /b 1

:port_found
echo Starting portfolio...
if not "%PORT%"=="%START_PORT%" echo Port %START_PORT% is busy. Using %PORT% instead.
echo URL: http://localhost:%PORT%
echo.

call npm run dev -- -p %PORT%

echo.
echo Server stopped.
pause
