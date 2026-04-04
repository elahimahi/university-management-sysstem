@echo off
REM Restart Apache for XAMPP
echo.
echo Restarting Apache Server...
echo.

REM Try to stop and start Apache using net commands
REM First, find the Apache service name

REM Method 1: Using XAMPP apache_start.bat
cd /d C:\xampp
echo Stopping Apache...
apache\bin\httpd.exe -k stop

timeout /t 2 /nobreak

echo Starting Apache...
apache\bin\httpd.exe -k start

timeout /t 2 /nobreak

echo.
echo Apache has been restarted!
echo.
echo Verifying Apache is running...
netstat -ano | findstr :80
echo.
echo Done! You can now try logging in again.
pause
