@echo off
REM Initialize MS SQL Server Database with Schema
REM This script creates all necessary tables for the University Management System

echo.
echo ======================================
echo  University Management System
echo  Database Initialization
echo ======================================
echo.

REM Get MS SQL Server connection details
set /p SERVER="Enter SQL Server name (default: MAHI\SQLEXPRESS): " || set SERVER=MAHI\SQLEXPRESS
set /p DATABASE="Enter Database name (default: university_db): " || set DATABASE=university_db

echo.
echo Initializing database at: %SERVER%\%DATABASE%
echo.

REM Run the schema file
sqlcmd -S %SERVER% -d %DATABASE% -i "%~dp0mssql_database.sql" -v ON_ERROR=EXIT

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database initialized successfully!
    echo.
    echo.
    echo Next steps:
    echo 1. Run backend: php -S localhost:8000 backend/router.php
    echo 2. Run frontend: npm start
    echo 3. Register as admin/faculty and add courses
    echo 4. Students can enroll in courses
    echo.
    pause
) else (
    echo.
    echo ❌ Database initialization failed!
    echo Please check your SQL Server connection.
    echo.
    pause
)
