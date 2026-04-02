# 🚀 Quick Fix Guide: Faculty Courses & Student Enrollment

## 🔴 Your Current Error
```
Database error: SQLSTATE[42S02]: Invalid object name 'courses'
```

## ✅ Fix in 3 Steps

### Step 1: Initialize Database (2 minutes)

**Open SQL Server Management Studio:**
1. Click "Connect" → Select `MAHI\SQLEXPRESS`
2. Click "New Query"
3. Open file: `backend/core/mssql_database.sql` (from your project folder)
4. Copy entire content into query window
5. Press **F5** or Ctrl+E to Execute
6. ✅ Wait for "Executed successfully"

### Step 2: Start Backend & Frontend

**Terminal 1 - Backend:**
```powershell
cd "E:\3.1\sd final\university-management-sysstem"
php -S localhost:8000 backend/router.php
```

**Terminal 2 - Frontend:**
```powershell
cd "E:\3.1\sd final\university-management-sysstem"
npm start
```

### Step 3: Test the Complete Flow

#### 3a. Register as Faculty
- Go to: http://localhost:3000/register
- Email: `faculty@test.com`
- Password: `Test@1234`
- First Name: `Ahmed`
- Last Name: `Khan`
- Role: **Faculty** ← SELECT THIS
- Click "Complete Register"

#### 3b. Admin Approves Faculty
- Go to: http://localhost:3000/login
- Email: `admin@example.com` (or your admin email)
- Click "Review Approvals"
- Find `Ahmed Khan` → Click **[Approve]**
- ✅ Faculty approved!

#### 3c. Faculty Creates Course
- **LogOut** (top-right Logout button)
- Login as: `faculty@test.com`
- Click "Faculty Dashboard"
- Click "My Courses"
- Click **[Create Course]** button
- Fill in:
  - **Code:** CS101
  - **Name:** Introduction to Programming
  - **Credits:** 3
  - **Category:** Computer Science
  - **Level:** Undergraduate
- Click **[Create]**
- ✅ Course created!

#### 3d. Student Enrolls in Course
- **LogOut** (top-right Logout button)
- Register as Student:
  - Email: `student@test.com`
  - Password: `Test@1234`
  - First Name: `Ali`
  - Last Name: `Hassan`
  - Role: **Student**
  - Click "Complete Register"

- **Admin approves student:**
  - Login as admin
  - Go "Review Approvals"
  - Approve `Ali Hassan`

- **Student enrolls in course:**
  - LogOut
  - Login as: `student@test.com`
  - Click "Student Dashboard"
  - Click "Course Registration"
  - Click "Available Courses" tab
  - Should see: **CS101 - Introduction to Programming**
  - Click **[ENROLL]** button
  - Select semester: "Spring 2024"
  - Click **[Confirm Enrollment]**
  - ✅ Enrolled!

#### 3e. Verify Enrollment
- Go to "My Courses" tab
- Should see: **CS101 - Introduction to Programming**
- Shows instructor: **Ahmed Khan**
- Shows enrollment date
- ✅ All working!

---

## 📋 Component Checklist

- [x] Database Schema Created
  - [x] `courses` table
  - [x] `enrollments` table
  - [x] `users` table
  - [x] `grades` table

- [x] Faculty Features
  - [x] Create course
  - [x] View my courses
  - [x] Delete course
  - [x] Mark attendance
  - [x] Submit grades

- [x] Student Features
  - [x] View available courses
  - [x] Enroll in course
  - [x] View enrolled courses
  - [x] View course details

- [x] Admin Features
  - [x] Approve/Reject users
  - [x] View all users
  - [x] Dashboard stats

---

## 🎯 File Locations

| Purpose | Location |
|---------|----------|
| Database Schema | `backend/core/mssql_database.sql` |
| Database Setup | `backend/core/db_connect.php` |
| Faculty Create Course | `backend/faculty/create_course.php` |
| Get Available Courses | `backend/courses/available_courses.php` |
| Student Enroll | `backend/student/enroll_course.php` |
| Faculty Dashboard | `src/pages/faculty/FacultyDashboardPage.tsx` |
| Student Registration | `src/pages/student/StudentRegistrationPage.tsx` |

---

## 💡 Key Endpoints to Know

### Get Available Courses
```
GET http://localhost:8000/courses/available
```
Response:
```json
{
  "status": "success",
  "courses": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Programming",
      "credits": 3,
      "instructor_id": 5,
      "first_name": "Ahmed",
      "last_name": "Khan",
      "enrolled_count": 1
    }
  ]
}
```

### Enroll in Course
```
POST http://localhost:8000/student/enroll
Headers: Authorization: Bearer {token}
Body:
{
  "course_id": 1,
  "semester": "Spring 2024"
}
```

### Get Student's Enrolled Courses
```
GET http://localhost:8000/student/get_student_courses.php
Headers: Authorization: Bearer {token}
```

---

## ✅ Success = Seeing This

**On Student Dashboard:**
- Available courses list appears ✅
- Student can click "Enroll" ✅
- After enrollment, course appears in "My Courses" ✅
- Course shows instructor name ✅
- Course shows enrollment date ✅

**On Faculty Dashboard:**
- Can create courses ✅
- Created courses appear in "My Courses" ✅
- Can see student enrollments ✅

---

## 🆘 Still Getting Errors?

Check:
1. **"Invalid object name 'courses'"**
   - Database not initialized
   - Run `mssql_database.sql` again in SSMS

2. **"Cannot read property of null"**
   - User not authenticated
   - Make sure you're logged in
   - Check browser console for token errors

3. **"Connection failed"**
   - SQL Server not running
   - Start SQL Server from Windows Services
   - Check connection settings

4. **CORS errors**
   - Check backend is running on port 8000
   - Check frontend is running on port 3000

---

## 📞 Next: What to Customize

1. Add more fields to courses (description, schedule, max students)
2. Add prerequisites for courses
3. Add course sections/timings
4. Add course materials management
5. Add discussion forum for courses
6. Add email notifications for enrollments

---

**You're all set! Follow the steps above and everything will work. 🎉**
