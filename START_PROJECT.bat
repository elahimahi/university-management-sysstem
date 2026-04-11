@echo off
REM University Management System - Complete Startup Script
REM এক নজরে সম্পূর্ণ প্রজেক্ট শুরু করবে

title University Management System Startup

echo.
echo =========================================
echo University Management System
echo =========================================
echo.
echo Starting Backend Server...
echo Backend will run on: http://localhost:8000
echo.

REM Start Backend Server in a new window
start "Backend Server (PHP)" cmd /k "npm run server"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

echo.
echo Backend started! Now starting Frontend...
echo Frontend will run on: http://localhost:3000
echo.

REM Start Frontend in a new window
start "Frontend Server (React)" cmd /k "npm start"

echo.
echo =========================================
echo ✓ সম্পূর্ণ সিস্টেম শুরু হয়েছে!
echo ✓ Both servers are starting...
echo.
echo আপনার ব্রাউজার এ যান: http://localhost:3000
echo Visit in your browser: http://localhost:3000
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause
