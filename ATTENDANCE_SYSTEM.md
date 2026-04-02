# Attendance System Documentation

## Overview
The attendance system allows faculty to mark attendance for their students, and students can view their attendance records and statistics across all their courses.

## Features Implemented

### 1. Backend API Endpoints

#### Faculty Endpoints

##### Mark Attendance
- **Endpoint**: `POST /faculty/mark-attendance`
- **Description**: Mark or update attendance for multiple students in a course
- **Request Body**:
```json
{
  "faculty_id": 1,
  "course_id": 2,
  "attendance_records": [
    {"enrollment_id": 5, "date": "2024-03-17", "status": "present"},
    {"enrollment_id": 6, "date": "2024-03-17", "status": "absent"},
    {"enrollment_id": 7, "date": "2024-03-17", "status": "late"}
  ]
}
```
- **Status Values**: `present`, `absent`, `late`
- **Response**:
```json
{
  "success": true,
  "message": "Attendance records processed: 3 successful, 0 failed",
  "successful": 3,
  "failed": 0,
  "errors": []
}
```

##### Get Course Students
- **Endpoint**: `GET /faculty/course-students?course_id=1&faculty_id=1&date=2024-03-17`
- **Description**: Get all students enrolled in a course with their current attendance status for a specific date
- **Query Parameters**:
  - `course_id` (required): The course ID
  - `faculty_id` (required): The faculty member's user ID
  - `date` (optional): Date for attendance (default: today)
  - `semester` (optional): Filter by semester
- **Response**:
```json
{
  "success": true,
  "course": {
    "id": 1,
    "name": "Database Management"
  },
  "date": "2024-03-17",
  "students": [
    {
      "enrollment_id": 5,
      "student_id": 10,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "semester": "Spring 2024",
      "attendance_status": "present",
      "attendance_date": "2024-03-17"
    }
  ],
  "statistics": {
    "total_students": 25,
    "present_count": 23,
    "absent_count": 1,
    "late_count": 1
  }
}
```

##### Get Attendance History
- **Endpoint**: `GET /faculty/attendance-history?course_id=1&faculty_id=1&limit=50`
- **Description**: Get attendance history for a course
- **Query Parameters**:
  - `course_id` (required): The course ID
  - `faculty_id` (required): The faculty member's user ID
  - `limit` (optional): Number of records to return (default: 50)
- **Response**: Returns recent attendance records and daily statistics

#### Student Endpoints

##### Get Student Attendance
- **Endpoint**: `GET /student/attendance?student_id=10`
- **Description**: Get all attendance records for a student across all courses
- **Response**:
```json
{
  "attendance": [
    {
      "course": "Database Management",
      "date": "2024-03-17",
      "status": "present"
    }
  ]
}
```

##### Get Attendance Statistics
- **Endpoint**: `POST /student/attendance-stats`
- **Description**: Get comprehensive attendance statistics for a student
- **Request Body**:
```json
{
  "student_id": 10,
  "course_id": 1 // Optional: filter by specific course
}
```
- **Response**:
```json
{
  "success": true,
  "statistics": [
    {
      "total_classes": 30,
      "present": 28,
      "absent": 1,
      "late": 1,
      "course_name": "Database Management",
      "course_code": "CS101",
      "attendance_percentage": 93.33
    }
  ],
  "recent_records": [
    {
      "date": "2024-03-17",
      "status": "present",
      "course_name": "Database Management",
      "course_code": "CS101"
    }
  ]
}
```

### 2. Frontend Components

#### FacultyAttendancePage (`src/pages/faculty/FacultyAttendancePage.tsx`)
**Features**:
- Course selection dropdown
- Date picker to select attendance marking date
- Real-time statistics display (total students, present, absent, late)
- Interactive student list with attendance status buttons
  - Three buttons per student: Present, Late, Absent
  - Visual feedback for selected status
  - Color-coded (green, yellow, red)
- Save Attendance button to submit all records at once
- Toast notifications for success/error messages
- Responsive design

**How to Use for Faculty**:
1. Navigate to Faculty Dashboard → Attendance
2. Select a course from the dropdown
3. Choose the date for attendance marking (defaults to today)
4. Review the attendance statistics preview
5. For each student, click the appropriate status button (Present, Late, or Absent)
6. Click "Save Attendance" to submit all records

#### StudentAttendancePage (`src/pages/student/StudentAttendancePage.tsx`)
**Features**:
- **Attendance Statistics by Course**:
  - Donut chart visualization for each course showing Present/Late/Absent distribution
  - Attendance percentage displayed prominently
  - Color-coded by percentage:
    - Green: 75% or above
    - Yellow: 60-74%
    - Red: Below 60%
- **Course Information**: Course code and name
- **Statistics Summary**: Total classes, Present, Late, Absent counts
- **Recent Attendance Records Table**:
  - Last 30 days of attendance
  - Date, Course, and Status columns
  - Color-coded status badges
- Empty state message when no records exist
- Error handling with detailed error messages

**How to Use for Students**:
1. Navigate to Student Dashboard → Attendance
2. View your attendance statistics for each course
3. Check the overall attendance percentage
4. Scroll down to see recent attendance records (last 30 days)
5. Plan to maintain 75% or higher attendance for best academic results

### 3. Service Class

#### AttendanceService (`src/services/attendance.service.ts`)
Provides methods for attendance operations with automatic token injection:

**Faculty Methods**:
- `getCourseStudents()`: Fetch students for attendance marking
- `markAttendance()`: Submit attendance records
- `getAttendanceHistory()`: Retrieve attendance history

**Student Methods**:
- `getStudentAttendance()`: Get all attendance records
- `getAttendanceStats()`: Get detailed attendance statistics

### 4. Database Schema

#### Attendance Table
```sql
CREATE TABLE attendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
    CONSTRAINT FK_Attendance_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT UC_Enrollment_Date UNIQUE(enrollment_id, date)
);
```

### 5. Router Updates

Updated `backend/index.php` with new attendance routes:

```php
// Faculty attendance routes
'mark-attendance' => 'faculty/mark_attendance.php',
'course-students' => 'faculty/get_course_students.php',
'attendance-history' => 'faculty/get_attendance_history.php',

// Student attendance routes
'attendance-stats' => 'student/get_attendance_stats.php'
```

## Workflow

### Faculty Workflow
```
Faculty Dashboard
    ↓
Attendance Page
    ↓
Select Course → Select Date
    ↓
Load Students (background)
    ↓
Mark Each Student (Present/Late/Absent)
    ↓
Click Save Attendance
    ↓
Backend validates and stores records
    ↓
Success notification
```

### Student Workflow
```
Student Dashboard
    ↓
Attendance Page
    ↓
View Statistics by Course
    ↓
See Attendance Percentage
    ↓
Review Recent Records (Last 30 days)
```

## Technical Implementation Details

### Error Handling
- Faculty cannot mark attendance for courses they don't teach
- Duplicate records are updated instead of creating errors
- Comprehensive error messages for debugging
- Toast notifications for user feedback

### Data Validation
- Status values are validated (present, absent, late only)
- Enrollment validation ensures student is in the course
- Date validation in database
- UNIQUE constraint prevents duplicate attendance records for same enrollment and date

### Performance Considerations
- Minimal queries per operation
- Efficient SQL joins for related data
- Pagination support in history endpoint
- Responsive UI with loading states

## Future Enhancements (Optional)
1. Bulk import attendance from CSV
2. Attendance reports generation
3. Alert system for low attendance
4. Attendance patterns analysis
5. Export attendance data
6. Automated attendance reminders
7. QR code-based attendance
8. Mobile app support

## Troubleshooting

### Issue: Attendance not saving
- **Solution**: Ensure the faculty_id matches the course instructor_id
- **Solution**: Check that the enrollment_id corresponds to the correct course

### Issue: Students not showing up
- **Solution**: Verify students have enrollment status as 'active'
- **Solution**: Check the enrollment semester matches

### Issue: Permission denied error
- **Solution**: Only course instructors can mark attendance for their courses
- **Solution**: Ensure logged-in user is the course instructor

## API Testing with cURL

```bash
# Mark attendance
curl -X POST http://localhost/Database_Project/Database-main/Database-main/backend/faculty/mark-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "faculty_id": 1,
    "course_id": 1,
    "attendance_records": [
      {"enrollment_id": 1, "date": "2024-03-17", "status": "present"}
    ]
  }'

# Get course students
curl -X GET "http://localhost/Database_Project/Database-main/Database-main/backend/faculty/course-students?course_id=1&faculty_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get student attendance stats
curl -X POST http://localhost/Database_Project/Database-main/Database-main/backend/student/attendance-stats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"student_id": 10}'
```

---

**Last Updated**: March 17, 2024
**Version**: 1.0.0
