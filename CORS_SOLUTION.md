# CORS Fix - Step by Step Solution

## ❌ Error:
```
No 'Access-Control-Allow-Origin' header is present on the requested resource
```

## ✅ Solution Applied:

### Step 1: Apache CORS Configuration
- ✅ Created: `c:\xampp\apache\conf\extra\httpd-cors.conf`
- ✅ Includes: Global CORS headers for all PHP requests
- ✅ Added Include: To `c:\xampp\apache\conf\httpd.conf`

### Step 2: Backend Configuration
- ✅ Simplified: `backend/.htaccess` (allows direct PHP access)
- ✅ Updated: `backend/auth/login.php` (CORS headers at top)
- ✅ Updated: `backend/auth/register.php` (CORS headers at top)
- ✅ Created: `backend/cors-test.php` (to verify CORS working)

### Step 3: What To Do Now

**⚠️ Critical: Restart Apache**

Run this command (use Administrator PowerShell):
```powershell
cd C:\xampp
apache\bin\httpd.exe -k stop
Start-Sleep -Seconds 2
apache\bin\httpd.exe -k start
```

Or double-click: `restart_apache.bat`

---

## 🔍 Verify It's Working

### Test 1: Check CORS Headers
Open in browser:
```
http://localhost/university-management-sysstem/backend/cors-test.php
```

Should see:
```json
{
  "status": "success",
  "message": "CORS headers test passed"
}
```

### Test 2: Check Health
Open in browser:
```
http://localhost/university-management-sysstem/backend/health-check.php
```

Should see:
```json
{
  "status": "ok",
  "database": "connected",
  "superadmins": 1
}
```

### Test 3: Try Login
1. Open: `http://localhost:3000/login`
2. Email: `superadmin@university.edu`
3. Password: `superadmin123`
4. Role: `Admin`
5. Click "Sign In"

Should redirect to dashboard ✅

---

## 📋 Files Changed:

### Modified:
- `c:\xampp\apache\conf\httpd.conf` - Added CORS Include
- `backend/.htaccess` - Simplified for direct file access
- `backend/auth/login.php` - CORS headers
- `backend/auth/register.php` - CORS headers  
- `backend/admin/approve_user.php` - CORS headers
- `backend/admin/reject_user.php` - CORS headers

### Created:
- `c:\xampp\apache\conf\extra\httpd-cors.conf` - Global CORS config
- `backend/cors-test.php` - CORS verification endpoint
- `restart_apache.bat` - Apache restart helper

---

## 🚨 If Still Getting CORS Error After Restart:

### Check 1: Apache Running?
```powershell
netstat -ano | findstr :80
# Should show: 0.0.0.0:80 LISTENING
```

### Check 2: Syntax Error in httpd.conf?
```powershell
cd C:\xampp\apache\bin
httpd.exe -t
# Should say: Syntax OK
```

### Check 3: mod_headers Enabled?
```powershell
cd C:\xampp\apache\bin
httpd -M | findstr headers
# Should show: headers_module
```

### Check 4: Clear Browser Cache
- Ctrl + Shift + Delete
- Select "All time"
- Check "Cookies and other site data"
- Check "Cached images and files"
- Click "Clear data"

Then try login again.

---

## 🔧 Manual Apache Restart (If .bat doesn't work)

### Via XAMPP Control Panel:
1. Open XAMPP Control Panel
2. Find "Apache"  
3. Click "Stop" (if running)
4. Wait 2 seconds
5. Click "Start"

### Via Command Prompt (Administrator):
```cmd
cd C:\xampp
apache\bin\httpd.exe -k stop
timeout /t 2
apache\bin\httpd.exe -k start
```

### Via Windows Services:
1. Press `Win+R`
2. Type: `services.msc`
3. Find: "Apache2.4" or similar
4. Right-click → "Restart"

---

## 📊 What The CORS Fix Does:

Before: 
```
Browser → React App (port 3000)
  ↓ (try to call API)
Browser CORS Validation
  ↗ No CORS headers ❌ BLOCKED
Backend (port 80)
```

After:
```
Browser → React App (port 3000)
  ↓ (try to call API)
Apache receives request
  ↓ (httpd-cors.conf)
  ↓ (adds CORS headers)
Backend receives request  
  ↓ (login.php)
  ↓ (adds CORS headers again for safety)
Response sent
  ↓ (CORS headers included)
Browser CORS Validation ✅ OK
  ↓
Browser receives response
  ↓
Login successful!
```

---

## ✨ Next Steps:

1. ✅ Restart Apache (critical!)
2. ✅ Test CORS endpoint: `cors-test.php`
3. ✅ Test Health: `health-check.php`
4. ✅ Try Login: `http://localhost:3000/login`
5. ✅ Access Dashboard: Auto-redirect after login

---

**Status**: All files configured ✅ 
**Next**: Restart Apache & Test
