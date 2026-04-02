# Complete Testing & Troubleshooting Guide

## Quick Start Testing

### Step 1: Verify Backend is Running
```powershell
# Check if Apache/PHP is running
netstat -ano | findstr :80

# Check if MySQL/SQL Server is running  
Get-Service | findstr -i "mysql\|sql"
```

### Step 2: Test Faculty Course Addition

**Via Frontend:**
1. Open http://localhost:3000 in browser
2. Login with faculty credentials
3. Click "My Courses" in dashboard
4. Click "Add Course" button
5. Fill in form:
   ```
   Course Code: TEST101
   Course Name: Test Course
   Credits: 3
   Category: Test
   Level: Undergraduate
   ```
6. Click "Add Course"
7. ✅ Should see "Course added successfully" toast
8. ✅ Course should appear in the list below

**Via API (PowerShell):**
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcl9pZCI6IjEiLCJpYXQiOjE3NzM3MjY1NzUsImV4cCI6MTc3MzczMDI3MX0=.bW9ja19zaWduYXR1cmU="

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    code = "CS101"
    name = "Introduction to Computer Science"
    credits = 3
    category = "Core"
    level = "Undergraduate"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost/Database_Project/Database-main/Database-main/backend/faculty/courses" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Step 3: Test Student Course Registration

**Via Frontend:**
1. Login as student (or create test student account)
2. Click "Registration" in sidebar menu
3. ✅ Should see list of available courses
4. Select semester from dropdown: "Spring 2024"
5. Click "Enroll Now" on any course
6. ✅ Should see success toast
7. ✅ Course should move to "Your Enrolled Courses" section
8. ✅ Button should change to "Already Enrolled" (disabled)

**Via API (PowerShell):**
```powershell
$studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwidXNlcl9pZCI6IjIiLCJpYXQiOjE3NzM3MjY1NzUsImV4cCI6MTc3MzczMDI3MX0=.bW9ja19zaWduYXR1cmU="

$headers = @{
    "Authorization" = "Bearer $studentToken"
    "Content-Type" = "application/json"
}

$body = @{
    course_id = 1
    semester = "Spring 2024"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost/Database_Project/Database-main/Database-main/backend/student/enroll" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## Detailed API Testing

### Available Courses Endpoint
```
GET /courses/available
Authentication: Required (any role)

Response Example:
{
  "status": "success",
  "courses": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "credits": 3,
      "category": "Core",
      "level": "Undergraduate",
      "instructor_id": 11,
      "first_name": "John",
      "last_name": "Doe",
      "enrolled_count": 2
    }
  ],
  "total": 1
}
```

### Student Enroll Endpoint
```
POST /student/enroll
Authentication: Required (student role)

Request Body:
{
  "course_id": 1,
  "semester": "Spring 2024"
}

Response Example:
{
  "status": "success",
  "message": "Successfully enrolled in course",
  "enrollment": {
    "id": 5,
    "student_id": 2,
    "course_id": 1,
    "semester": "Spring 2024",
    "status": "active",
    "enrolled_at": "2024-03-17 10:30:45",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "credits": 3,
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Student Courses Endpoint
```
GET /student/courses
Authentication: Required (student role)

Response Example:
{
  "status": "success",
  "courses": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "credits": 3,
      "category": "Core",
      "level": "Undergraduate",
      "semester": "Spring 2024",
      "status": "active",
      "enrolled_at": "2024-03-17 10:30:45",
      "first_name": "John",
      "last_name": "Doe"
    }
  ],
  "total": 1
}
```

## Database Verification

### Check Courses Added
```sql
SELECT * FROM courses ORDER BY created_date DESC;
-- Should show courses added through the faculty dashboard
```

### Check Student Enrollments
```sql
SELECT 
  e.id, 
  e.student_id, 
  e.course_id, 
  c.code, 
  c.name, 
  e.semester, 
  e.status
FROM enrollments e
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC;
-- Should show all student enrollments
```

### Verify Instructor Assignment
```sql
SELECT 
  c.id,
  c.code,
  c.name,
  u.first_name,
  u.last_name,
  u.email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id
WHERE c.instructor_id IS NOT NULL;
-- Should show courses with assigned instructors
```

## Troubleshooting

### Issue: "Authorization required" error
**Solution**: 
- Check if you're logged in
- Verify token is in localStorage with key 'authToken'
- Try logging out and logging back in
- Check Authorization header is being sent correctly

### Issue: "Course not found" when enrolling
**Solution**:
- Verify course exists in database: `SELECT * FROM courses`
- Check course_id is correct integer value
- Verify no SQL errors in backend logs

### Issue: "Already enrolled in this course"
**Solution**:
- This is expected behavior - one enrollment per student per semester per course
- Try enrolling in a different course
- Try enrolling for a different semester
- Check current enrollments: `SELECT * FROM enrollments WHERE student_id = [id]`

### Issue: Courses not appearing in dashboard
**Solution**:
- Check if faculty is logged in with correct credentials
- Verify token is valid: Check expiration in token payload
- Check database: `SELECT * FROM courses WHERE instructor_id = [faculty_id]`
- Try refreshing page (F5)
- Check browser console for errors (F12)

### Issue: Page shows "Loading courses..." indefinitely  
**Solution**:
- Check if backend is running: `netstat -ano | findstr :80`
- Check API endpoint manually in browser
- Look at Network tab in Developer Tools (F12)
- Check if API response is valid JSON
- Check PHP error logs

### Issue: SQL errors in the backend
**Solution**:
- Check SQL Server is running
- Verify database connection string in `backend/core/db_connect.php`
- Run this command to test connection:
  ```powershell
  sqlcmd -S DESKTOP-83A2G7T\SQLEXPRESS -Q "SELECT 1"
  ```
- Check if tables exist:
  ```sql
  SELECT * FROM INFORMATION_SCHEMA.TABLES
  ```

## Files Modified Summary

### Backend (PHP)
1. ✅ `backend/courses/available_courses.php` - **NEW** - Get all courses
2. ✅ `backend/student/enroll_course.php` - **NEW** - Student enrollment
3. ✅ `backend/student/get_student_courses.php` - **UPDATED** - Added auth
4. ✅ `backend/index.php` - **UPDATED** - Added new routes

### Frontend (React/TypeScript)
1. ✅ `src/pages/student/StudentRegistrationPage.tsx` - **UPDATED** - Full implementation

## Success Indicators

✅ **Faculty can:**
- [ ] Add new courses through the dashboard
- [ ] See list of their courses
- [ ] View course details (code, name, credits, etc.)
- [ ] Data persists after refresh
- [ ] Data is stored in SQL Server

✅ **Student can:**
- [ ] View all available courses
- [ ] Filter courses by code/name
- [ ] Select a semester
- [ ] Click to enroll in courses
- [ ] See their enrolled courses
- [ ] Cannot re-enroll in same course for same semester
- [ ] Data persists after refresh
- [ ] Data is stored in SQL Server

✅ **System:**
- [ ] All API endpoints return proper JSON responses
- [ ] Authentication works correctly
- [ ] Database queries execute without errors
- [ ] Frontend and backend communicate properly
- [ ] Error handling shows appropriate messages

## Performance Testing

### Test Large Course List
1. In database, verify enrollment count query:
   ```sql
   SELECT 
     c.id,
     c.code,
     COUNT(e.id) as enrolled_count
   FROM courses c
   LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
   GROUP BY c.id, c.code
   ```

2. Load student registration page and verify it loads in < 2 seconds

### Test Course Addition Speed
1. Add 10 courses in rapid succession
2. Measure response time for each
3. All should complete successfully without errors

## Next Steps

After successful testing:

1. **Data Backup**: Back up SQL Server database
2. **Performance Optimization**: Monitor slow queries
3. **User Training**: Set up demo for users
4. **Monitoring**: Set up error logging
5. **Documentation**: Update user manual

---

**Version**: 1.0
**Last Updated**: March 17, 2026
**Status**: Ready for Testing ✅
