#!/usr/bin/env powershell
<#
╔════════════════════════════════════════════════════════════════════╗
║  🎓 University Database Management System - Full Project Launcher  ║
║                      PowerShell Version                            ║
╚════════════════════════════════════════════════════════════════════╝

This script starts the complete project:
- PHP Backend Server (port 5000)
- React Frontend Server (port 3000)
- Opens browser to application

Usage: .\run-project.ps1
#>

param(
    [switch]$NoOpen = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════╗"
Write-Host "║  🎓 University Database Management System - Full Project Launcher  ║"
Write-Host "╚════════════════════════════════════════════════════════════════════╝"
Write-Host ""

# Get project paths
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"

Write-Host "[*] Project Root: $ProjectRoot"
Write-Host "[*] Backend Dir: $BackendDir"
Write-Host ""

# Check PHP
Write-Host "[Checking] PHP Installation..."
$phpCheck = php -v 2>&1 | Select-String "^PHP"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] PHP not found! Please install PHP 8.2+ with XAMPP" -ForegroundColor Red
    exit 1
} else {
    $phpVersion = ($phpCheck -split ' ')[1]
    Write-Host "[OK] PHP $phpVersion detected" -ForegroundColor Green
}

# Check Node.js
Write-Host "[Checking] Node.js Installation..."
$nodeVersion = node -v 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js not found! Please install Node.js 14+" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] Node.js $nodeVersion detected" -ForegroundColor Green
}

# Check npm
Write-Host "[Checking] npm Installation..."
$npmVersion = npm -v 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm not found!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] npm $npmVersion detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "[Checking] MS SQL Server Drivers..."
$sqlsrvCheck = php -m 2>&1 | Select-String "sqlsrv"
if ($sqlsrvCheck -eq $null) {
    Write-Host "[WARNING] SQL Server drivers may not be properly installed" -ForegroundColor Yellow
} else {
    Write-Host "[OK] SQL Server drivers loaded" -ForegroundColor Green
}

# Start Backend Server
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════"
Write-Host "[Starting] Backend Server (PHP)..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════"
Write-Host ""

$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; Write-Host 'Starting PHP development server on localhost:5000...'; php -S localhost:5000 router.php" -PassThru -WindowStyle Normal
Write-Host "[Background] Backend PID: $($backendProcess.Id)"

Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════"
Write-Host "[Starting] Frontend Server (React)..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════"
Write-Host ""

$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; Write-Host 'Starting React development server on localhost:3000...'; npm start" -PassThru -WindowStyle Normal
Write-Host "[Background] Frontend PID: $($frontendProcess.Id)"

Start-Sleep -Seconds 5

# Display status
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "[Success] All Servers Started!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "🎓 University Database Management System Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔗 Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "💾 Database: university_db (MS SQL Server)" -ForegroundColor Yellow
Write-Host ""

# Open browser
if (-not $NoOpen) {
    Write-Host "[Opening] Browser to http://localhost:3000..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "📚 Documentation:"
Write-Host "   - API Docs: BACKEND_API.md"
Write-Host "   - Setup Guide: PROJECT_SETUP.md"
Write-Host "   - Project Info: README.md"
Write-Host ""
Write-Host "✅ Project is ready for demonstration!" -ForegroundColor Green
Write-Host ""
Write-Host "🚨 To stop all servers:"
Write-Host "   - Close the terminal windows"
Write-Host "   - Or run: Stop-Process -Id $($backendProcess.Id); Stop-Process -Id $($frontendProcess.Id)"
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Keep main window open
Read-Host "Press Enter to continue monitoring (close windows to stop)"
