@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Please install Node.js from https://nodejs.org/ and retry.
  pause
  exit /b 1
)
node serve.cjs --open
if errorlevel 1 pause
