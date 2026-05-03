@echo off
TITLE Selenium to Playwright Converter (Local LLM)
echo ===================================================
echo 🚀 Launching Converter...
echo 🤖 Model: codellama
echo ===================================================

:: 1. Check Python Environment
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b
)

:: 2. Check Ollama
call python tools/ollama_handshake.py
if %errorlevel% neq 0 (
    echo [ERROR] Ollama connection failed. Please ensure Ollama is running.
    pause
    exit /b
)

:: 3. Start Server in Background
echo.
echo [INFO] Starting Backend Server...
start "Converter Backend" /MIN python tools/server.py

:: 4. Launch UI
echo [INFO] Opening UI...
timeout /t 2 >nul
start ui/index.html

echo.
echo ===================================================
echo ✅ System Running!
echo    - UI: Opened in default browser
echo    - Server: http://localhost:8000
echo    - Logs: Check the "Converter Backend" window
echo ===================================================
pause
