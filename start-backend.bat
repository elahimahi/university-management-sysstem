@echo off
echo Starting PHP Backend on http://localhost:5000...
cd /d %~dp0\backend
php -S localhost:5000 router.php
