# Attendance System - Quick Start Guide

## For Faculty: How to Mark Attendance

### Step 1: Navigate to Attendance
- Go to your Faculty Dashboard
- Click on "Attendance" in the sidebar menu

### Step 2: Select Course and Date
```
┌─────────────────────────────────┐
│  Select Course: [CS101 - Database] │ ← Choose your course
│  Date: [2024-03-17]              │ ← Pick the attendance date
└─────────────────────────────────┘
```

### Step 3: View Statistics
```
┌──────────┬──────────┬────────┬──────────┐
│  Total   │ Present  │  Late  │  Absent  │
│   25     │   23     │   1    │    1     │
└──────────┴──────────┴────────┴──────────┘
```

### Step 4: Mark Students
For each student, click the appropriate button:

```
┌─────────────────────────────────────┐
│ John Doe (john@example.com)        │
│  [✓ Present] [Late] [✗ Absent]    │  ← Selected: Present (green)
├─────────────────────────────────────┤
│ Jane Smith (jane@example.com)      │
│  [✓ Present] [Late] [✗ Absent]    │  ← Can change by clicking
├─────────────────────────────────────┤
│ Bob Johnson (bob@example.com)      │
│  [Present] [Late] [✗ Absent]      │  ← Selected: Absent (red)
└─────────────────────────────────────┘
```

### Step 5: Save
Click the **"Save Attendance"** button at the bottom.

**Result**: ✅ "Attendance marked: 25 student(s)"

---

## For Students: How to View Attendance

### Step 1: Navigate to Attendance
- Go to your Student Dashboard
- Click on "Attendance" in the sidebar menu

### Step 2: View Your Course Attendance

**For each course, you'll see:**

```
┌──────────────────────────────────┐
│  CS101 - Database Management  │
│  📊 Attendance: 93.33%        │  ← Your percentage
│  ┌────────────────────────────┐
│  │  ▓▓▓▓░ 28/30 Present      │  ← Pie chart visualization
│  │  1/30 Late                │
│  │  1/30 Absent              │
│  └────────────────────────────┘
│  Total classes: 30            │
└──────────────────────────────────┘
```

### Step 3: View Recent Records

**Scroll down to see your last 30 days:**

```
Date              Course          Status
2024-03-17        CS101           ✓ Present
2024-03-16        CS101           ● Late
2024-03-15        CS101           ✓ Present
2024-03-14        CS101           ✗ Absent
2024-03-13        CS102           ✓ Present
...
```

---

## Color Coding

### Attendance Status
| Status | Color  | Display |
|--------|--------|---------|
| Present | 🟢 Green   | ✓ |
| Late | 🟡 Yellow  | ⏱ |
| Absent | 🔴 Red    | ✗ |

### Attendance Percentage
| Percentage | Color | Status |
|-----------|-------|--------|
| ≥ 75%    | 🟢 Green   | Good |
| 60-74%   | 🟡 Yellow  | Warning |
| < 60%    | 🔴 Red    | Critical |

---

## Database: What Happens Behind the Scenes

### When Faculty Marks Attendance

```
Faculty clicks "Save Attendance" for 25 students
                    ↓
         [POST] /faculty/mark-attendance
                    ↓
    Backend receives:
    {
      faculty_id: 1,
      course_id: 5,
      attendance_records: [
        {enrollment_id: 10, date: "2024-03-17", status: "present"},
        {enrollment_id: 11, date: "2024-03-17", status: "absent"},
        ...
      ]
    }
                    ↓
    ✓ Verify: Faculty teaches course 5
    ✓ Verify: Student enrolled in course 5
    ✓ Validate: Status in ['present', 'absent', 'late']
                    ↓
    INSERT INTO attendance (enrollment_id, date, status)
    VALUES (10, '2024-03-17', 'present'), ...
                    ↓
    ✅ Success: 25 records inserted
                    ↓
    Return to Frontend → Toast: "Attendance marked: 25 student(s)"
```

### When Student Views Attendance

```
Student loads Attendance page
                    ↓
         [POST] /student/attendance-stats
                    ↓
    Backend receives: {student_id: 15}
                    ↓
    Query 1: Get all enrolled courses
    SELECT courses... FROM enrollments WHERE student_id = 15
                    ↓
    Query 2: For each course, calculate:
    - Total classes attended
    - Count present, late, absent
    - Calculate percentage
    - Get last 30 records
                    ↓
    Data sent to Frontend:
    {
      statistics: [
        {
          course_code: "CS101",
          course_name: "Database",
          total_classes: 30,
          present: 28,
          late: 1,
          absent: 1,
          attendance_percentage: 93.33
        },
        ...
      ],
      recent_records: [
        {date: "2024-03-17", status: "present", course_code: "CS101"},
        ...
      ]
    }
                    ↓
    Frontend renders charts and tables
    ↓
    ✅ Student sees beautiful dashboard
```

---

## API Endpoints Summary

### For Development

```
Faculty APIs:
POST   /faculty/mark-attendance           → Mark attendance for students
GET    /faculty/course-students           → Get students in course
GET    /faculty/attendance-history        → View attendance history

Student APIs:
GET    /student/attendance                → Get all attendance records
POST   /student/attendance-stats          → Get detailed statistics
```

### Example Request (with curl)

```bash
# Get students ready to mark attendance
curl -X GET "http://localhost:3001/faculty/course-students?course_id=1&faculty_id=1&date=2024-03-17" \
  -H "Authorization: Bearer <token>"

# Response shows all students in course with existing attendance
```

---

## Common Scenarios

### Scenario 1: Faculty Forgets Student Was Present
- Go to Attendance page
- Select same course and date
- Click Present for that student
- Click Save
- ✅ Record automatically updates (no duplicate error)

### Scenario 2: Student Checks Their Attendance
- Student opens Attendance page
- Sees all courses and percentages
- If percentage < 75%, they know they need to attend more
- Can see exactly which dates they were absent/late

### Scenario 3: Multiple Courses
- Student has enrolled in 3 courses
- Dashboard shows attendance for all 3 courses simultaneously
- Can compare performance across courses

---

## Troubleshooting

### "Faculty is not the instructor for this course"
**Cause**: You're trying to mark attendance for a course you don't teach
**Fix**: Only course instructors can mark attendance

### "Student not showing in list"
**Cause**: Student not enrolled in course
**Fix**: Have the student enroll first from Student Registration page

### "Attendance not saving"
**Cause**: Backend connection issue
**Fix**: 
1. Check if backend is running
2. Check browser console for errors
3. Verify your authorization token is valid

---

## Tips & Best Practices

✅ **Do:**
- Mark attendance on the same day as the class
- Double-check before saving (no undo button yet)
- Use "Late" status sparingly for actual late arrivals
- Review your attendance percentage weekly

❌ **Don't:**
- Mark attendance for courses you don't teach
- Mark attendance more than once per day
- Use wrong status values
- Ignore low attendance warnings

---

**Created**: March 17, 2024
**Last Updated**: March 17, 2024
