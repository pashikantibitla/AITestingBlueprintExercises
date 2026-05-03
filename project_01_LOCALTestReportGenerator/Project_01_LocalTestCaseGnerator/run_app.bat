@echo off
echo ===================================================
echo 🚀 Launching B.L.A.S.T. Local Test Case Generator
echo ===================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and try again.
    pause
    exit /b
)

:: Optional: Check for requirements (simplified)
echo [INFO] checking dependencies...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Could not install dependencies automatically.
    echo Please run 'pip install -r requirements.txt' manually if errors occur.
) else (
    echo [SUCCESS] Dependencies verified.
)

echo.
echo [INFO] Starting Server...
echo [INFO] Open your browser to: http://localhost:5000
echo.

python tools/server.py

pause
