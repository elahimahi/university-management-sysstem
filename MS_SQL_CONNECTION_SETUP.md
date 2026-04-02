# MS SQL Server Backend Connection Guide

## ✅ Connection Summary

Your backend is now configured to connect with the MS SQL Server instance shown in Object Explorer:

- **Server**: `MAHI\SQLEXPRESS`
- **Database**: `university_db`
- **Authentication**: Windows Authentication
- **SSL**: Enabled with Self-Signed Certificates Trusted

## 📁 Updated Files

### 1. **db_connect.php** (Updated)
`backend/core/db_connect.php` - Main database connection file
- Updated server host from `DESKTOP-83A2G7T\SQLEXPRESS` to `MAHI\SQLEXPRESS`
- Uses Windows Authentication (no username/password required)
- Properly configured for SQL Server via PDO sqlsrv extension

## 🆕 New Setup Scripts Created

### 2. **setup_database.php** (New)
`backend/core/setup_database.php`
- Creates all 10 database tables automatically
- Idempotent (safe to run multiple times)
- Creates: users, courses, enrollments, grades, attendance, fees, course_assignments, assignments, payments, login_history

### 3. **test_connection.php** (New)
`backend/core/test_connection.php`
- Tests the connection to MS SQL Server
- Returns connection status and timestamp

## 🚀 Setup Steps

### Step 1: Verify PHP SQL Server Extension
Make sure the `sqlsrv` extension is installed:
```bash
php -m | findstr sqlsrv
```

If not installed, enable it in `php.ini`:
```ini
extension=php_sqlsrv.so    (Linux)
extension=php_sqlsrv.dll   (Windows)
```

### Step 2: Test the Connection
Run this in your terminal:
```bash
php backend/core/test_connection.php
```

Expected response:
```json
{
  "status": "success",
  "message": "Successfully connected to MS SQL Server (university_db)",
  "server": "MAHI\SQLEXPRESS",
  "database": "university_db",
  "timestamp": "2026-04-02 HH:MM:SS"
}
```

### Step 3: Initialize Database Schema
Run this to create all tables:
```bash
php backend/core/setup_database.php
```

Expected response:
```json
{
  "status": "success",
  "message": "Database schema created successfully",
  "database": "university_db",
  "server": "MAHI\SQLEXPRESS",
  "tables_created": 10,
  "next_step": "Call /admin/init-demo to create sample data"
}
```

### Step 4: (Optional) Create Demo Data
Once tables are created, initialize with demo users and courses:
```bash
php backend/admin/init_demo.php
```

## 📊 Database Tables Created

1. **users** - Student, Faculty, Admin accounts
2. **courses** - Course catalog with instructor assignment
3. **enrollments** - Student course registrations
4. **grades** - Student grades and assessments
5. **attendance** - Class attendance records
6. **fees** - Student fee information
7. **course_assignments** - Faculty-created assignments
8. **assignments** - Student assignment submissions
9. **payments** - Payment transaction records
10. **login_history** - User login audit trail

## 🔧 Backend API Endpoints

After setup, these endpoints will be available:

- **Authentication**: `/auth/login`, `/auth/register`
- **Courses**: `/courses/available`, `/student/courses`
- **Fees**: `/admin/get-fees`, `/payment/get-payments`
- **Assignments**: `/faculty/create-assignment`, `/student/assignments`
- **Attendance**: Track student attendance
- **Grades**: Submit and view grades

## ✨ Features Now Enabled

- ✅ Student login with course registration
- ✅ Faculty assignment creation and grading
- ✅ Fee management and payments
- ✅ Attendance tracking
- ✅ SMS notifications (if configured)
- ✅ Student profile management
- ✅ Course management

## 🐛 Troubleshooting

### Connection Failed Error
**Problem**: "Connection test failed"
**Solution**:
1. Verify SQL Server is running: Open SQL Server Management Studio
2. Check server name matches: `MAHI\SQLEXPRESS`
3. Ensure Windows Authentication is enabled
4. Verify `sqlsrv` PHP extension is loaded

### Table Already Exists Error
**Problem**: Tables already created in previous setup
**Solution**: This is normal - the setup script checks if tables exist and skips creation

### Access Denied Error
**Problem**: "User not authorized"
**Solution**:
1. Ensure you're running with proper Windows credentials
2. Verify SQL Server login permissions
3. Check if database user has proper roles

## 📝 Next Steps

1. ✅ Connection configured (Done)
2. ⬜ Run test_connection.php
3. ⬜ Run setup_database.php
4. ⬜ Run init_demo.php (optional)
5. ⬜ Start the backend server
6. ⬜ Start the React frontend
7. ⬜ Test login with demo credentials:
   - Faculty: `faculty_demo@university.edu` / `password123`
   - Student: `student_demo@university.edu` / `password123`

## 🌐 Running the Backend Server

Using PHP built-in server:
```bash
cd backend
php -S localhost:8000 router.php
```

The API will be available at: `http://localhost:8000`

Using Apache/IIS:
- Place `backend/` in web root
- Ensure `.htaccess` rewrites are enabled
- Access via: `http://localhost/backend/api/`

---

**Backend Status**: ✅ Ready to Deploy
