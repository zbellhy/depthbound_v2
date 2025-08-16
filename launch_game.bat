@echo off
setlocal ENABLEDELAYEDEXPANSION
title Depthbound - Local Server
chcp 65001 >nul

:: Check Python
where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python not found on PATH. Install Python 3.8+ from https://www.python.org/downloads/ and retry.
  pause
  exit /b 1
)

set PORT=8000
echo Starting local server on http://localhost:%PORT% ...
start "" python -c "import webbrowser, time; time.sleep(1); webbrowser.open('http://localhost:%PORT%/')"
python -m http.server %PORT%
