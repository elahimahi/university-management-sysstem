# ✅ Admin-Only Registration System - Verification Checklist

## 🎯 Pre-Flight Checks

### Backend
- [ ] Backend running on port 8000: `netstat -ano | findstr :8000`
- [ ] React running on port 3000: `netstat -ano | findstr :3000`
- [ ] Database connected: MAHI\SQLEXPRESS
- [ ] Database university_db exists

### Environment
- [ ] `.env.development` has `REACT_APP_API_BASE_URL=http://localhost:8000`
- [ ] No admin account in database yet (for first registration)

---

## 🚀 Test Sequence

### Step 1: Check System Status
```bash
# Terminal: Check if servers are running
netstat -ano | findstr :3000    # React
netstat -ano | findstr :8000    # Backend
```

Expected: Both ports showing LISTENING

### Step 2: Test API Connection
```bash
# Test if backend is reachable
curl http://localhost:8000/test-connection.php
```

Expected Response:
```json
{
  "status": "success",
  "message": "Backend API is running",
  "database": "Connected to MAHI\\SQLEXPRESS - university_db"
}
```

### Step 3: Visit Diagnostics Page
```
URL: http://localhost:3000/diagnostics
```

Expected:
- ✅ Backend API Connection: Success
- ✅ Database Connection: Success
- ✅ Admin Registration Check: Success

### Step 4: Register First Admin
```
URL: http://localhost:3000/register

Fill in:
- First Name: Super
- Last Name: Admin
- Email: admin@university.edu
- Password: AdminPass123! (min 8 chars)
- Role: Admin (select from dropdown)
- Accept terms

Click: Complete Register
```

Expected:
- ✅ Registration successful
- ✅ Auto-redirects to admin dashboard
- ✅ Admin is already logged in (no approval needed)

### Step 5: Verify Admin Dashboard Access
```
URL: http://localhost:3000/admin/dashboard
```

Expected:
- ✅ Can view admin options
- ✅ Can access "User Verification" panel

---

## ❌ Test Admin Restriction

### Try to Register Second Admin (Should Fail)
```
URL: http://localhost:3000/register

Fill in:
- First Name: Second
- Last Name: Admin
- Email: admin2@university.edu
- Password: AdminPass123!
- Role: Admin

Click: Complete Register
```

Expected Error:
```
❌ Error
Admin account already exists
💡 Only one admin can be registered. Contact your administrator...
```

---

## ✅ Test Student Registration

### Register a Student
```
URL: http://localhost:3000/register

Fill in:
- First Name: Ahmed
- Last Name: Khan
- Email: ahmed@university.edu
- Password: StudentPass123!
- Role: Student

Click: Complete Register
```

Expected:
- ⏳ "User registered successfully. Awaiting admin approval."
- ❌ No tokens provided (cannot login yet)

### Try to Login as Pending Student
```
URL: http://localhost:3000/login

Email: ahmed@university.edu
Password: StudentPass123!
Role: Student

Click: Sign In
```

Expected Error:
```
"Your registration is waiting for admin approval"
```

---

## 👑 Test Admin Approval

### Admin Approves Student
```
URL: http://localhost:3000/admin/verify

1. See list of pending users (Ahmed Khan)
2. Click GREEN APPROVE button
3. Success message appears
```

### Student Can Now Login
```
URL: http://localhost:3000/login

Email: ahmed@university.edu
Password: StudentPass123!
Role: Student

Click: Sign In
```

Expected:
- ✅ Login successful
- ✅ Redirects to student dashboard

---

## 🔍 Database Verification

### Check users table (SQL Server Management Studio)
```sql
SELECT id, email, role, approval_status FROM users;
```

Expected Result:
```
id | email                | role    | approval_status
1  | admin@university.edu | admin   | approved
2  | ahmed@university.edu | student | approved
```

---

## 📋 All Tests Passing When

- ✅ First admin registers successfully
- ✅ Second admin registration blocked
- ✅ Student registration shows "pending"
- ✅ Student cannot login when pending
- ✅ Admin can approve registrations
- ✅ Approved student can login
- ✅ Error messages display clearly
- ✅ No network errors

---

## 🐛 Common Issues & Fixes

### Issue: Network Error on Registration
```
Fix: Start backend
cd backend
php -S localhost:8000 router.php
```

### Issue: API returns 404
```
Fix: Check .env.development
REACT_APP_API_BASE_URL=http://localhost:8000
Restart: npm start
```

### Issue: Can register second admin
```
Fix: Admin check logic not working
Verify register.php has this code:
if ($role === 'admin') {
    $adminCheckStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'");
    $adminCheckStmt->execute();
    $result = $adminCheckStmt->fetch();
    if ($result['admin_count'] > 0) {
        http_response_code(403);
        echo json_encode(['message' => 'Admin account already exists']);
        exit;
    }
}
```

### Issue: Student can login without approval
```
Fix: Check login.php has approval status check
Verify roles are correctly stored (admin/student/faculty)
```

---

## 🎯 Success Criteria

Mark complete when ALL pass:

- [ ] System diagnostics all green
- [ ] First admin registration works
- [ ] Second admin blocked
- [ ] Student registration pending
- [ ] Student cannot login pending
- [ ] Admin can approve
- [ ] Approved student can login
- [ ] Error messages clear and helpful
- [ ] No console errors
- [ ] Database shows correct approval_status

---

## 📱 Browser Tools

### Check Network Errors
1. **F12** - Open Developer Tools
2. Go to **Network** tab
3. Try registration
4. Look for requests to `/auth/register.php`
5. Check response status and data

### Check Console Logs
1. **F12** - Open Developer Tools
2. Go to **Console** tab
3. Look for:
   - `[auth.service] registerUser`
   - `Registration failed` (if error)
   - `Network error` details

---

## 🚀 Ready When

- ✅ Both servers running
- ✅ Database connected
- ✅ All diagnostic tests pass
- ✅ You understand the flow

---

## 🎓 System Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           USER REGISTRATION                     │
└─────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
      ┌───▼────┐            ┌────▼────┐
      │  Admin │            │ Student │
      │        │            │ Faculty │
      └───┬────┘            └────┬────┘
          │                      │
      ┌───▼────────────┐   ┌─────▼──────────┐
      │ Auto-Approved  │   │  Pending ⏳    │
      │ BUT            │   │  (Waiting for  │
      │ ONLY if        │   │   admin OK)    │
      │ NO ADMIN       │   │                │
      │ EXISTS YET     │   └─────┬──────────┘
      └───┬────────────┘         │
          │                      │
    ┌─────▼──────────┐      ┌────▼─────────┐
    │ CAN LOGIN ✅   │      │ CANNOT LOGIN  │
    │ Immediately    │      │ ❌ Yet        │
    └────────────────┘      └────┬─────────┘
                                 │
                        ┌────────▼────────┐
                        │  Admin Reviews  │
                        │  /admin/verify  │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐           ┌─────▼──────┐
              │  APPROVED  │           │  REJECTED  │
              │  ✅ LOGIN  │           │  ❌ DENIED │
              └────────────┘           └────────────┘
```

---

## 📞 Need Help?

1. Check: `ADMIN_SYSTEM_READY.md` - Overview
2. Check: `ADMIN_REGISTRATION_TESTING.md` - Detailed testing
3. Check: `ADMIN_APPROVAL_SYSTEM.md` - Full documentation

---

**Status**: ✅ **READY FOR TESTING**

Start with: http://localhost:3000/register

Good luck! 🚀
