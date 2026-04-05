# University Management System - Configuration Guide

## Network Error Fix

### Issue
Getting network error when logging in through Apache server

### Solution

#### 1. Verify Services Running
```powershell
# Check Apache (port 80)
netstat -ano | findstr :80

# Should show: 0.0.0.0:80 LISTENING
```

#### 2. Clear Browser Cache & Restart
```
Ctrl+Shift+Delete → Clear all cache
Close browser completely
Restart Apache in XAMPP Control Panel
```

#### 3. Create .env File (Frontend)
Create file: `c:\xampp\htdocs\Database_Project\university-management-sysstem\.env`

```
REACT_APP_API_BASE_URL=http://localhost/university-management-sysstem/backend
REACT_APP_NAME=University Management System
REACT_APP_VERSION=1.0.0
```

#### 4. Rebuild Frontend
```powershell
cd c:\xampp\htdocs\Database_Project\university-management-sysstem
npm run build
```

#### 5. Test Network Diagnostic
```
Open in browser:
http://localhost/university-management-sysstem/backend/network-diagnostic.php
```

Expected response:
```json
{
  "status": "ok",
  "checks": {
    "database": { "status": "connected" },
    "superadmin": { "status": "exists", "count": 1 },
    "cors": { "status": "working" }
  }
}
```

#### 6. Test Health Check
```
http://localhost/university-management-sysstem/backend/health-check.php
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "superadmins": 1
}
```

---

## SuperAdmin Dashboard - Access Steps

### 1. Login URL
```
http://localhost/university-management-sysstem/
or
http://localhost:3000/login
```

### 2. Credentials
- **Email**: `superadmin@university.edu`
- **Password**: `superadmin123`
- **Role**: Admin (will auto-switch to SuperAdmin)

### 3. Auto-Redirect
After login → Automatically goes to:
```
http://localhost:3000/admin/dashboard
```

### 4. Dashboard Features
- ✅ View all users
- ✅ Approve/Reject pending users
- ✅ Manage courses
- ✅ Manage fees
- ✅ System statistics

---

## Single SuperAdmin Enforcement

Only ONE SuperAdmin account can exist:

### Check Current Status
```powershell
cd c:\xampp\htdocs\Database_Project\university-management-sysstem\backend
php enforce_single_superadmin.php
```

### Verify in Database
```sql
SELECT id, email, role FROM users WHERE role = 'superadmin'
-- Should return exactly 1 row
```

---

## Common Issues & Solutions

### Issue: "Network Error" on Login
**Solution**:
1. Restart Apache
2. Check `http://localhost/university-management-sysstem/backend/health-check.php`
3. Check browser console (F12) for CORS errors
4. Verify `.env` file exists

### Issue: Can't Access Dashboard
**Solution**:
1. Check if logged in as SuperAdmin (not Admin)
2. Check approval_status = 'approved' in database
3. Clear cache and restart browser

### Issue: "Invalid Role"
**Solution**:
1. Login with role dropdown showing "Admin"
2. SuperAdmin will override automatically
3. Check browser console for role validation

### Issue: MySQL/Database Connection Failed
**Solution**:
1. Start MySQL service in XAMPP
2. Verify database credentials in `backend/core/db_connect.php`
3. Check SQL Server if using MSSQL

---

## File Locations

- Frontend: `src/` (React/TypeScript)
- Backend API: `backend/auth/login.php`
- Database Config: `backend/core/db_connect.php`
- Frontend Config: `.env` (in root)
- CORS Config: `backend/.htaccess`

---

## Testing Commands

### Test Backend via Command Line
```bash
curl -X POST http://localhost/university-management-sysstem/backend/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@university.edu","password":"superadmin123","role":"admin"}'
```

### Expected Response
```json
{
  "user": {
    "id": 31,
    "email": "superadmin@university.edu",
    "first_name": "Super",
    "last_name": "Admin",
    "role": "superadmin",
    "approval_status": "approved"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600
  }
}
```

---

## Next Steps

1. ✅ Check Apache is running (port 80)
2. ✅ Create `.env` file with correct API_BASE_URL
3. ✅ Run `npm run build` 
4. ✅ Test network diagnostic endpoint
5. ✅ Try login with SuperAdmin credentials
6. ✅ Access dashboard

If issues persist, check:
- Apache error logs: `xampp/apache/logs/error.log`
- PHP error logs: `xampp/php/php_error.log`
- Browser console: F12 → Console tab
