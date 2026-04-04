@echo off
REM This script restarts Apache. Run as Administrator!

echo Restarting Apache...
cd C:\xampp\apache\bin

echo Stopping Apache...
httpd.exe -k stop

timeout /t 2

echo Starting Apache...
httpd.exe -k start

echo Apache restart complete!
pause
