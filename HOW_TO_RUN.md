# How to Run the University Management System

## ⚡ Quick Start (Windows)

### Prerequisites
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **PHP** (v7.4+) - [Download](https://www.php.net/downloads.php)
- **MS SQL Server** - Must be running and configured

---

## 🚀 Step 1: Start the Backend (PHP Server)

Open **PowerShell** or **Command Prompt** in the project root and run:

```powershell
# Navigate to backend folder
cd backend

# Start PHP built-in server on port 8000
php -S localhost:8000
```

**Expected Output:**
```
Development Server (http://localhost:8000)
Listening on http://localhost:8000
Document root is E:\3.1\sd final\university-management-sysstem\backend
```

> **Keep this terminal open!** The backend must stay running.

---

## 🎨 Step 2: Start the Frontend (React)

Open a **new terminal** (PowerShell/Command Prompt) in the project root:

```powershell
# Install dependencies (first time only)
npm install

# Start React development server
npm start
```

**Expected Output:**
```
webpack compiled with ... warnings
Compiled successfully!
On Your Network: http://<your-ip>:3000

Local: http://localhost:3000
```

---

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **CORS:** ✅ Enabled for localhost:3000

---

## ✅ Troubleshooting

### "Cannot connect to backend" / CORS Errors

**Problem:** Browser shows CORS errors or "Network Error"

**Solution:**
1. ✅ Verify backend is running on port 8000
2. ✅ Check if both terminals show "running" status
3. ✅ Try accessing `http://localhost:8000/health-db.php` to test backend

### "Port 3000 already in use"

```powershell
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Port 8000 already in use"

```powershell
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Database Connection Failed

1. Verify **MS SQL Server is running**
2. Check `backend/core/db_connect.php` for correct credentials
3. Ensure database is initialized (check `SETUP_INSTRUCTIONS.md`)

---

## 🛑 Stopping the Project

1. **Stop React:** Press `Ctrl + C` in the React terminal
2. **Stop PHP Backend:** Press `Ctrl + C` in the PHP terminal
3. Close both terminals

---

## 📝 Environment Variables (Optional)

Create `.env` in the project root to override defaults:

```env
# Frontend
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000
```

---

## 🔧 Using the Batch Files

Some automated scripts are available:

- `run-project.bat` - Starts both servers (may require admin rights)
- `start-backend.bat` - Starts only the PHP backend
- `fix-deadlines.bat` - Runs maintenance tasks

> **Note:** Batch files may have UAC restrictions on Windows. Manual terminal commands are recommended.

---

## 📊 Useful Commands

```powershell
# Test if backend is responding
curl http://localhost:8000/health-db.php

# View running processes on port 8000
netstat -ano | findstr :8000

# View running processes on port 3000
netstat -ano | findstr :3000

# Build for production
npm run build

# Run tests
npm test
```

---

## 🎯 Full Workflow

```
1. Start Backend (Terminal 1)
   cd backend
   php -S localhost:8000

2. Start Frontend (Terminal 2)
   npm start

3. Open Browser
   http://localhost:3000

4. Login
   Use your credentials

5. Develop/Test
   Make changes, auto-reload happens

6. Stop Everything
   Ctrl+C in both terminals
```

---

## 📞 Common Issues Checklist

- [ ] Is PHP running on port 8000?
- [ ] Is Node.js/React running on port 3000?
- [ ] Is MS SQL Server running and configured?
- [ ] Are both terminals still open?
- [ ] Did you see "Compiled successfully" for React?
- [ ] Did you see "Listening on http://localhost:8000" for PHP?

---

## 🎓 Need Help?

Check these files for more info:
- `SETUP_INSTRUCTIONS.md` - Database setup
- `QUICK_START.md` - Overview
- `BACKEND_API.md` - API documentation
