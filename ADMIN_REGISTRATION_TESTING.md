# 👑 Admin Registration Testing Guide

## 🎯 Current System Status

✅ **Backend Server**: Running on `http://localhost:8000`
✅ **React Frontend**: Running on `http://localhost:3000`
✅ **Database**: Connected to `MAHI\SQLEXPRESS - university_db`
✅ **Admin Approval System**: Active

---

## 📋 Admin Registration Rules

### ✅ What's Allowed
- **First Admin**: Can register without restrictions
- **Auto-Approval**: Admin account is automatically approved
- **Immediate Login**: Admin can login right after registration

### ❌ What's NOT Allowed
- **Second Admin**: Only ONE admin account allowed
- **Error Message**: "Admin account already exists" if trying to create second admin

---

## 🧪 Test Flow

### Step 1: Check the Diagnostics Page
Go to: **http://localhost:3000/diagnostics**

This page will show:
- ✅ Backend API connection status
- ✅ Database connection status
- ✅ Admin registration system status

---

### Step 2: Register First Admin

**URL**: http://localhost:3000/register

**Steps**:
1. Click **Register Button**
2. Fill in:
   - First Name: `Super`
   - Last Name: `Admin`
   - Email: `admin@university.edu`
   - Password: `AdminPass123!`
   - Confirm Password: `AdminPass123!`
3. Select **Admin** as role
4. (Optional) Upload a profile photo
5. Accept terms and conditions
6. Click **Complete Register**

**Expected Result**: ✅ Redirects to admin dashboard automatically

---

### Step 3: Test Admin Approval Dashboard

**URL**: http://localhost:3000/admin/verify

**Actions**:
- View list of pending student/faculty registrations
- Approve users ✅
- Reject users with reasons ❌

---

### Step 4: Try to Register Second Admin (Should Fail)

**URL**: http://localhost:3000/register

1. Fill in different admin details:
   - First Name: `Second`
   - Last Name: `Admin`
   - Email: `admin2@university.edu`
   - Password: `AdminPass123!`
2. Select **Admin** role
3. Click **Complete Register**

**Expected Result**: ❌ Error message appears:
```
❌ Error
Admin account already exists
💡 Tip: Only one admin account can be registered. Contact your administrator...
```

---

### Step 5: Register Student (Should be Pending)

**URL**: http://localhost:3000/register

1. Fill in:
   - First Name: `Ahmed`
   - Last Name: `Khan`
   - Email: `ahmed@university.edu`
   - Password: `StudentPass123!`
2. Select **Student** role
3. Complete registration

**Expected Result**: ⏳ Message shows "Awaiting admin approval"

---

### Step 6: Admin Approves Student

1. **Login as Admin**
   - Email: `admin@university.edu`
   - Password: `AdminPass123!`
   - Role: `Admin`

2. Go to: **http://localhost:3000/admin/verify**

3. Find **Ahmed Khan** in pending list

4. Click **✅ APPROVE**

5. Success message appears

---

### Step 7: Test Approved Student Login

1. Logout from admin account
2. Go to: http://localhost:3000/login
3. Login as student:
   - Email: `ahmed@university.edu`
   - Password: `StudentPass123!`
   - Role: `Student`

**Expected Result**: ✅ Login successful, redirects to student dashboard

---

## 🔧 API Endpoints for Testing

### Test Backend Connection
```bash
curl http://localhost:8000/test-connection.php
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Backend API is running",
  "database": "Connected to MAHI\SQLEXPRESS - university_db",
  "timestamp": "2026-04-02 10:30:00"
}
```

### Register Admin (First Time - Should Work)
```bash
curl -X POST http://localhost:8000/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "AdminPass123!",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "admin"
  }'
```

**Expected**: Status 201, user approved, tokens provided

### Register Admin (Second Time - Should Fail)
```bash
curl -X POST http://localhost:8000/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@university.edu",
    "password": "AdminPass123!",
    "firstName": "Second",
    "lastName": "Admin",
    "role": "admin"
  }'
```

**Expected**: Status 403, error message about admin existing

---

## 🐛 Troubleshooting

### Problem: "Network Error" on Registration
**Solution**:
1. Check backend is running: `netstat -ano | findstr :8000`
2. If not running: `cd backend && php -S localhost:8000 router.php`
3. Refresh browser (Ctrl+F5)

### Problem: "Failed to load /auth/register.php"
**Solution**:
1. Check React environment: `.env.development` should have `REACT_APP_API_BASE_URL=http://localhost:8000`
2. Restart React: `npm start`

### Problem: Can't register second admin but want to
**Solution**:
- This is by design - only 1 admin allowed
- Delete the first admin from database if needed (SQL Server Management Studio)
- Then you can register a new admin

### Problem: Student can't login after approval
**Solution**:
1. Verify admin approved the user (check `approval_status = 'approved'` in database)
2. Try logout and login again
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📊 Expected Database State

After successful test flow:

**users table**:
```
id | email                | role    | approval_status
1  | admin@university.edu | admin   | approved      ✅
2  | ahmed@university.edu | student | approved      ✅
```

---

## ✨ Features Working

✅ First admin registers successfully
✅ Second admin registration blocked
✅ Non-admin registrations pending
✅ Admin can approve/reject users
✅ Only approved users can login
✅ Error messages display in UI
✅ Database tracks all approvals

---

## 🎓 What Each Role Can Do

### Admin Role
- ✅ Register (only first one allowed)
- ✅ Auto-approved, login immediately
- ✅ View pending user registrations
- ✅ Approve/reject registrations
- ✅ Access admin dashboard

### Faculty Role
- ⏳ Register (status: pending)
- ❌ Cannot login until approved
- ✅ After approval: Create/manage courses
- ✅ After approval: Grade assignments

### Student Role
- ⏳ Register (status: pending)
- ❌ Cannot login until approved
- ✅ After approval: View courses
- ✅ After approval: Submit assignments

---

## 📞 Quick Checklist

Before testing, verify:

- [ ] Backend running on port 8000
- [ ] React running on port 3000
- [ ] Database connected to MAHI\SQLEXPRESS
- [ ] Tables created in university_db
- [ ] .env.development has correct API_BASE_URL
- [ ] No admin account exists yet in database

---

## 🎯 Success Criteria

All tests pass when:
- ✅ First admin registration works
- ✅ Second admin registration fails (expected)
- ✅ Student registration shows "pending"
- ✅ Student cannot login until approved
- ✅ Admin can approve/reject
- ✅ Approved student can login
- ✅ Error messages display clearly

---

**Status**: Ready for Testing! 🚀
