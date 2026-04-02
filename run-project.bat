@echo off
REM =========================================================================
REM University Database Management System - Full Project Launcher
REM =========================================================================
REM This script starts the complete project:
REM - PHP Backend Server (port 5000)
REM - React Frontend Server (port 3000)
REM - Opens browser to application
REM =========================================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║  🎓 University Database Management System - Full Project Launcher  ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Get the current directory
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"

echo [*] Project Root: %PROJECT_ROOT%
echo [*] Backend Dir: %BACKEND_DIR%
echo.

REM Check if PHP is installed
echo [Checking] PHP Installation...
php -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP not found! Please install PHP 8.2+ with XAMPP
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('php -v ^| findstr /R "^PHP"') do set PHP_VERSION=%%i
    echo [OK] PHP !PHP_VERSION! detected
)

REM Check if Node.js is installed
echo [Checking] Node.js Installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js 14+
    pause
    exit /b 1
) else (
    for /f %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! detected
)

REM Check if npm is installed
echo [Checking] npm Installation...
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
) else (
    for /f %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION! detected
)

echo.
echo [Checking] MS SQL Server Drivers...
php -m | findstr /I "sqlsrv" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] SQL Server drivers may not be properly installed
) else (
    echo [OK] SQL Server drivers loaded
)

echo.
echo ════════════════════════════════════════════════════════════════════
echo [Starting] Backend Server (PHP)...
echo ════════════════════════════════════════════════════════════════════
echo.

REM Start backend server in a new window
start "Backend Server - University DB" cmd /k "cd /d !BACKEND_DIR! && echo Starting PHP development server on localhost:5000... && echo. && php -S localhost:5000 router.php"

REM Wait for backend to start
timeout /t 3 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════════
echo [Starting] Frontend Server (React)...
echo ════════════════════════════════════════════════════════════════════
echo.

REM Start frontend server in a new window
start "Frontend Server - University DB" cmd /k "cd /d !PROJECT_ROOT! && echo Starting React development server on localhost:3000... && echo. && npm start"

REM Wait for frontend to start
timeout /t 5 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════════
echo [Success] All Servers Started!
echo ════════════════════════════════════════════════════════════════════
echo.

echo 🎓 University Database Management System Ready!
echo.
echo 📍 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo 💾 Database: university_db (MS SQL Server)
echo.

REM Wait a moment before opening browser
timeout /t 2 /nobreak

REM Open browser to application
echo [Opening] Browser... http://localhost:3000
start http://localhost:3000

echo.
echo 📚 Documentation:
echo    - API Docs: BACKEND_API.md
echo    - Setup Guide: PROJECT_SETUP.md
echo    - Project Info: README.md
echo.
echo ✅ Project is ready for demonstration!
echo.
echo 🛑 To stop all servers:
echo    - Close the terminal windows, or press Ctrl+C in each terminal
echo.
echo ════════════════════════════════════════════════════════════════════
echo.

endlocal
