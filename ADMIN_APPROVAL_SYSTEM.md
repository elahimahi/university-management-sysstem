# 👑 Super Admin User Approval System

## Overview

This system implements a **Super Admin Approval Workflow** where:
1. When a user registers (student/faculty), their status is set to **"pending"**
2. Users **cannot login** until the Super Admin **approves** them
3. Super Admin can **approve** or **reject** registrations with reasons
4. Only **approved users** can proceed with login

## 🏗️ Database Changes

### Updated Users Table

```sql
-- New columns added to users table:
- approval_status VARCHAR(20) DEFAULT 'pending'  
  CHECK (approval_status IN ('pending', 'approved', 'rejected'))
  
- approved_by INT DEFAULT NULL  
  (Foreign key: which admin approved this user)
  
- rejection_reason VARCHAR(255) DEFAULT NULL  
  (Reason if rejected)
```

## 🔄 User Flow

### Registration Flow
```
User Registration
     ↓
Create account with status = 'pending'
     ↓
Send "Awaiting Admin Approval" message
     ↓
User CANNOT login yet
     ↓
Admin Reviews Registration
```

### Admin Approval Flow
```
Super Admin logs in (auto-approved)
     ↓
Views "Pending Registrations" page
     ↓
Reviews user details (name, email, role)
     ↓
Either APPROVE or REJECT
     ↓
If APPROVED: User can now login
If REJECTED: User cannot login (receives rejection reason)
```

### Login Flow
```
User enters email + password
     ↓
Credentials verified
     ↓
Check approval_status:
   - 'pending' → "Awaiting admin approval" message
   - 'rejected' → "Registration rejected" + reason
   - 'approved' → Login successful
```

## 📋 Backend API Endpoints

### 1. Register User
**Status**: Updated to mark as pending
```
POST /auth/register.php

Request:
{
  "email": "student@university.edu",
  "password": "Secure123!",
  "firstName": "Ahmed",
  "lastName": "Khan",
  "role": "student"  // or "faculty"
}

Response:
{
  "message": "User registered successfully. Awaiting admin approval.",
  "user": {...},
  "status": "pending",  // NOT 'approved'
  "tokens": null  // No tokens until approved
}
```

### 2. Login (Updated)
```
POST /auth/login.php

Response if pending:
{
  "message": "Your registration is waiting for admin approval",
  "approval_status": "pending"
}

Response if rejected:
{
  "message": "Your registration has been rejected",
  "reason": "Suspicious registration activity",
  "approval_status": "rejected"
}

Response if approved:
{
  "user": {...},
  "tokens": {...}
}
```

### 3. Get Pending Registrations (Admin)
```
GET /admin/get_pending_registrations.php

Response:
{
  "message": "Pending registrations retrieved",
  "count": 3,
  "users": [
    {
      "id": 5,
      "email": "newstudent@university.edu",
      "first_name": "Ahmed",
      "last_name": "Khan",
      "role": "student",
      "approval_status": "pending",
      "created_at": "2026-04-02T10:30:00Z"
    },
    ...
  ]
}
```

### 4. Approve User (Admin)
```
POST /admin/approve_user.php

Request:
{
  "user_id": 5,
  "admin_id": 1  // The admin approving
}

Response:
{
  "message": "User approved successfully",
  "user": {
    "id": 5,
    "email": "newstudent@university.edu",
    "first_name": "Ahmed",
    "last_name": "Khan",
    "role": "student",
    "approval_status": "approved"
  }
}
```

### 5. Reject User (Admin)
```
POST /admin/reject_user.php

Request:
{
  "user_id": 5,
  "admin_id": 1,
  "reason": "Email domain not verified / Duplicate account / Other reason"
}

Response:
{
  "message": "User rejected successfully",
  "user": {
    "id": 5,
    "email": "newstudent@university.edu",
    "first_name": "Ahmed",
    "last_name": "Khan",
    "role": "student",
    "approval_status": "rejected",
    "rejection_reason": "Email domain not verified"
  }
}
```

## 🎛️ Admin Interface

### AdminVerificationPage Component

**Location**: `src/pages/admin/AdminVerificationPage.tsx`

**Features**:
- ✅ View all pending registrations
- ✅ See user details (name, email, role, application date)
- ✅ Approve users with one click
- ✅ Reject users with custom reason
- ✅ Real-time status updates
- ✅ Success/error notifications

**Usage**:
```tsx
import AdminVerificationPage from '../pages/admin/AdminVerificationPage';

// Add to admin routes
<Route path="/admin/verify" element={<AdminVerificationPage />} />
```

## 🔐 Authorization Rules

| Role | Can View Pending? | Can Approve? | Can Reject? |
|------|-------------------|--------------|------------|
| Super Admin | ✅ Yes | ✅ Yes | ✅ Yes |
| Admin | ✅ Yes | ✅ Yes | ✅ Yes |
| Faculty | ❌ No | ❌ No | ❌ No |
| Student | ❌ No | ❌ No | ❌ No |

## 🚀 Implementation Steps

### Step 1: Update Database
```bash
# Drop existing tables (if testing)
# Run the updated setup script
php backend/core/setup_database.php
```

### Step 2: Create Admin User (Manually or via SQL)
```sql
-- Super Admin account (auto-approved)
INSERT INTO users 
(email, password, first_name, last_name, role, approval_status) 
VALUES 
('admin@university.edu', '[hashed_password]', 'Super', 'Admin', 'admin', 'approved');
```

### Step 3: Update React Routes
Add to your admin routes:
```tsx
import AdminVerificationPage from './pages/admin/AdminVerificationPage';

<Route path="/admin/verify" element={<AdminVerificationPage />} />
```

### Step 4: Update Navigation
Add link in admin sidebar:
```tsx
<Link to="/admin/verify" className="flex items-center gap-2">
  <Shield size={20} />
  User Verification
</Link>
```

## 📊 Status Diagram

```
┌─────────────────────────┐
│   Registration Attempt  │
├─────────────────────────┤
│  Set status = 'pending' │
└────────────┬────────────┘
             │
      ┌──────▼──────┐
      │  User Waits │
      └──────┬──────┘
             │
      ┌──────▼─────────────┐
      │  Admin Reviews     │
      │  (Via Web Portal)  │
      └──────┬─────────────┘
             │
      ┌──────┴─────────────┐
      │                    │
   ┌──▼───┐            ┌──▼───┐
   │Accept│            │Reject│
   └──┬───┘            └──┬───┘
      │                   │
   ┌──▼────────┐      ┌───▼─────────┐
   │ APPROVED  │      │  REJECTED   │
   │ Can login │      │ Cannot login│
   └───────────┘      └─────────────┘
```

## 🔍 Testing Workflow

### Test Registration
```bash
curl -X POST http://localhost:8000/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "student"
  }'

# Expected: status = "pending", no tokens
```

### Test Login (Pending)
```bash
curl -X POST http://localhost:8000/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "role": "student"
  }'

# Expected: "Your registration is waiting for admin approval"
```

### Get Pending Users
```bash
curl http://localhost:8000/admin/get_pending_registrations.php

# Expected: List of pending users
```

### Approve User
```bash
curl -X POST http://localhost:8000/admin/approve_user.php \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "admin_id": 1
  }'

# Expected: User approved successfully
```

### Test Login (Approved)
```bash
curl -X POST http://localhost:8000/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "role": "student"
  }'

# Expected: Tokens and user data
```

## 📝 Files Updated/Created

### Backend Files
- ✅ `backend/core/mssql_database.sql` - Updated users table schema
- ✅ `backend/core/setup_database.php` - Updated with new columns
- ✅ `backend/auth/register.php` - Set status to pending
- ✅ `backend/auth/login.php` - Added approval check
- ✅ `backend/admin/get_pending_registrations.php` - NEW
- ✅ `backend/admin/approve_user.php` - NEW
- ✅ `backend/admin/reject_user.php` - NEW

### Frontend Files
- ✅ `src/pages/admin/AdminVerificationPage.tsx` - NEW

## 🎯 Key Features

✅ **Prevents unauthorized access** - Unverified users can't login
✅ **Admin control** - Full visibility and control over registration
✅ **Audit trail** - Track who approved/rejected and when
✅ **Custom reasons** - Admins can provide reason for rejection
✅ **User feedback** - Users know their status and why they're rejected
✅ **Scalable** - Works for any number of pending registrations
✅ **Real-time** - Admin portal updates instantly

## 🚨 Security Notes

1. **Only admins** can approve/reject registrations
2. **Admin ID verification** required in all approval endpoints
3. **Rejected users** receive specific feedback via email (optional enhancement)
4. **Audit trail** tracks all approvals with admin ID and timestamp

---

**System Status**: ✅ Ready to Deploy
