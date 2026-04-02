# 🎓 Quick Run Commands

## Easiest Way - Double Click!

### Windows Users:
```
Double-click: run-project.bat
```

This will:**
- ✅ Check all system requirements
- ✅ Start PHP Backend Server (port 5000)
- ✅ Start React Frontend Server (port 3000)
- ✅ Automatically open http://localhost:3000 in your browser

---

## If Using PowerShell

```powershell
.\run-project.ps1
```

---

## Manual Commands (If Scripts Fail)

### Terminal 1 - Start Backend:
```bash
cd Database\backend
php -S localhost:5000
```

### Terminal 2 - Start Frontend:
```bash
cd Database
npm start
```

### Then:
- Open browser to: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## ⚡ Project Status

When running:
```
✅ Frontend:  http://localhost:3000
✅ Backend:   http://localhost:5000  
✅ Database:  university_db (MS SQL Server)
```

---

## 📊 What to Show Teacher

1. **Login/Register** at http://localhost:3000
2. **User Dashboard** - See real data from MS SQL Server
3. **API Endpoints** - Show working REST API
4. **SQL Server** - Show actual database tables and data
5. **Code Structure** - Professional organization

---

## 📖 Documentation Files

- **DEMO_GUIDE.md** - Complete presentation guide (read before showing!)
- **README.md** - Project overview
- **BACKEND_API.md** - All 22+ API endpoints
- **PROJECT_SETUP.md** - Installation details

---

**Everything is ready! Just double-click `run-project.bat` and you're good to go! 🚀**
