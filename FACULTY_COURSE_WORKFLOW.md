# Faculty Course Management & Student Enrollment Workflow

## 🔴 Current Issue
Error: "Invalid object name 'courses'" - The database tables haven't been created yet.

## ✅ Solution: Initialize Database

### Step 1: Create Database Tables (One-time setup)

**Option A: Using SQL Server Management Studio (EASIEST)**
1. Open SQL Server Management Studio
2. Connect to: `MAHI\SQLEXPRESS`
3. Right-click on `university_db` → Click "New Query"
4. Open: `backend/core/mssql_database.sql`
5. Copy-paste ALL the code into the query window
6. Click Execute (F5) or press Ctrl+Shift+E
7. ✅ All tables created!

**Option B: Using Command Line**
```powershell
sqlcmd -S MAHI\SQLEXPRESS -d university_db -i "C:\path\to\backend\core\mssql_database.sql"
```

**Option C: Using PHP Script**
```bash
php backend/core/init_database.php
```

---

## 📚 Complete Workflow After Setup

### 👨‍🏫 Step 1: Faculty Members Add Courses

**Frontend Path:**
```
Faculty Dashboard 
  → My Courses 
  → Create Course Button
```

**What Faculty Enters:**
- Course Code (e.g., CS101)
- Course Name (e.g., Introduction to Programming)
- Credits (e.g., 3)
- Category (e.g., Computer Science)
- Level (e.g., Undergraduate)

**Backend API Called:**
- `POST /faculty/create_course.php`
- Stores course in `courses` table with `instructor_id = faculty_id`

---

### 👨‍🎓 Step 2: Student Views Available Courses

**Frontend Path:**
```
Student Dashboard 
  → Course Registration 
  → Available Courses Tab
```

**What Happens:**
1. Frontend calls: `GET /courses/available`
2. Backend returns all courses with:
   - Course details (code, name, credits, level)
   - Instructor name
   - Student enrollment count
3. Student sees list of all available courses

**Example:**
```
┌─────────────────────────────────────┐
│ Available Courses                   │
├─────────────────────────────────────┤
│ CS101 - Programming Basics          │
│ Instructor: Dr. Ahmed Khan          │
│ Credits: 3 | Level: Undergraduate   │
│ 45 students enrolled                │
│ [ENROLL BUTTON]                     │
│                                     │
│ CS102 - Web Development             │
│ Instructor: Prof. Sarah Johnson     │
│ Credits: 4 | Level: Intermediate    │
│ 32 students enrolled                │
│ [ENROLL BUTTON]                     │
└─────────────────────────────────────┘
```

---

### ✍️ Step 3: Student Enrolls in Course

**Frontend Path:**
```
Student Registration Page 
  → Select Semester (e.g., Spring 2024)
  → Click [ENROLL] on any course
```

**What Happens:**
1. Frontend calls: `POST /student/enroll`
   - Sends: `course_id` and `semester`
2. Backend creates record in `enrollments` table
3. Links student to course with semester info
4. Shows success message

**Database Record:**
```sql
enrollments table:
- student_id: 5 (the logged-in student)
- course_id: 101 (CS101)
- semester: "Spring 2024"
- status: "active"
- enrolled_at: 2024-04-03 10:30:00
```

---

### 📖 Step 4: Enrolled Courses Appear on Student Dashboard

**Frontend Path:**
```
Student Dashboard 
  → My Courses Tab
```

**What Student Sees:**
1. All enrolled courses appear
2. Course details shown:
   - Course name & code
   - Instructor name
   - Credits
   - Enrollment status ("active", "completed", "dropped")
   - Enrollment date

**Example:**
```
┌──────────────────────────────────┐
│ My Enrolled Courses              │
├──────────────────────────────────┤
│ CS101 - Programming Basics       │
│ Instructor: Dr. Ahmed Khan       │
│ Credits: 3 | Status: Active ✓   │
│ Enrolled: April 3, 2024          │
│                                  │
│ [View Assignments]               │
│ [View Grades]                    │
│ [Mark Attendance]                │
└──────────────────────────────────┘
```

---

## 🔄 API Endpoints Summary

### Faculty Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/faculty/create_course.php` | Create new course |
| GET | `/faculty/get_my_courses.php` | List faculty's courses |
| DELETE | `/faculty/delete_course.php` | Delete course |
| POST | `/faculty/save_attendance.php` | Mark attendance |
| POST | `/faculty/submit_grades.php` | Submit student grades |

### Student Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/courses/available` | View all available courses |
| POST | `/student/enroll` | Enroll in a course |
| GET | `/student/get_student_courses.php` | Get enrolled courses |
| GET | `/student/get_student_grades.php` | View grades |
| GET | `/student/get_student_attendance.php` | View attendance |
| POST | `/student/submit_assignment.php` | Submit assignment |

---

## 🗃️ Database Tables Used

```
courses
├── id (Primary Key)
├── code (e.g., "CS101")
├── name (e.g., "Programming Basics")
├── credits
├── category
├── level
├── instructor_id (FK → users.id)
└── created_at

enrollments
├── id (Primary Key)
├── student_id (FK → users.id)
├── course_id (FK → courses.id)
├── semester (e.g., "Spring 2024")
├── status ("active", "completed", "dropped")
└── enrolled_at

grades
├── id (Primary Key)
├── enrollment_id (FK → enrollments.id)
├── grade (e.g., "A+")
├── grade_point (e.g., 4.0)
├── assessment_type
└── recorded_at

attendance
├── id (Primary Key)
├── enrollment_id (FK → enrollments.id)
├── date
├── status ("present", "absent", "late")
└── constraints: One record per student per course per day
```

---

## ✅ Testing the Complete Flow

1. **Verify Database Initialized**
   ```bash
   # Check using SQL Server Management Studio
   # Should see: users, courses, enrollments, grades, attendance, fees, assignments tables
   ```

2. **Start Backend & Frontend**
   ```bash
   # Terminal 1: Backend
   php -S localhost:8000 backend/router.php
   
   # Terminal 2: Frontend
   npm start
   ```

3. **Register Faculty**
   - Go to: http://localhost:3000/register
   - Select "Faculty" role
   - Complete registration
   - Wait for admin approval

4. **Admin Approves Faculty**
   - Log in as admin
   - Go to "Review Approvals"
   - Approve the faculty member

5. **Faculty Creates Course**
   - Log in as faculty
   - Dashboard → My Courses → Create Course
   - Fill in course details
   - Click "Create"

6. **Student Enrolls**
   - Register as student (pending approval)
   - Admin approves student
   - Log in as student
   - Dashboard → Course Registration → Available Courses
   - Click "Enroll" on faculty's course
   - Select semester and confirm

7. **Check Enrollment**
   - Student: Dashboard → My Courses (should see the course)
   - Faculty: Dashboard → My Courses (should show student enrolled)

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Invalid object name 'courses'" | Run database initialization (see above) |
| No courses appear | Check if faculty created any courses |
| Student can't enroll | Ensure student is approved, check semester field |
| Course doesn't show in my courses | Verify enrollment was successful |

---

## 📞 Support

If issues persist:
1. Check browser console for frontend errors
2. Check PHP error logs for backend errors
3. Verify database connection in `backend/core/db_connect.php`
4. Ensure all tables exist: `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'`
