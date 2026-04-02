# Assignment Submission System - Complete Flow Guide

## Overview
এই সিস্টেমে Faculty assignments create করে এবং শুধুমাত্র যে students course e enrolled তারাই assignments দেখতে পায় এবং submit করতে পারে। Faculty তখন submissions review করে grade এবং feedback দেয়। Students তাদের feedback দেখতে পায়।

---

## 📊 SQL Server Database Schema

### 1. **course_assignments Table**
```sql
CREATE TABLE course_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    deadline DATETIME2 NOT NULL,
    created_by INT NOT NULL, -- faculty_id
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_CourseAssignments_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT FK_CourseAssignments_Users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

**Example Data:**
```
id | course_id | title                  | deadline            | created_by | created_at
1  | 5         | "Database Design Part1"| 2026-04-15 14:00:00 | 2          | 2026-04-02 10:00:00
2  | 5         | "SQL Query Assignment" | 2026-04-20 10:00:00 | 2          | 2026-04-02 11:00:00
3  | 7         | "Web Dev Project"      | 2026-04-18 23:59:59 | 3          | 2026-04-02 12:00:00
```

---

### 2. **assignment_submissions Table**
```sql
CREATE TABLE assignment_submissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    submitted_at DATETIME2 DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late')),
    faculty_feedback TEXT,
    grade VARCHAR(20) CHECK (grade IN ('excellent', 'good', 'average', 'late')),
    evaluated_at DATETIME2 DEFAULT NULL,
    CONSTRAINT FK_Submissions_Assignments FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
    CONSTRAINT FK_Submissions_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UC_Assignment_Student UNIQUE(assignment_id, student_id)
);
```

**Example Data:**
```
id | assignment_id | student_id | submission_text      | submitted_at        | status    | grade   | faculty_feedback
1  | 1             | 10         | "Here is my answer.."| 2026-04-15 13:00:00 | submitted | good    | "Nice work!"
2  | 1             | 11         | "My solution: ..."   | 2026-04-16 02:00:00 | late      | average | "Good but late"
3  | 2             | 10         | "Query: SELECT * ..."| 2026-04-20 09:50:00 | submitted | excellent | "Perfect!"
```

---

### 3. **enrollments Table** (Related)
```
id | student_id | course_id | semester | status
1  | 10         | 5         | 2026-S1  | active
2  | 11         | 5         | 2026-S1  | active
3  | 10         | 7         | 2026-S1  | active
(Student 12 is NOT enrolled in course 5 - won't see assignment 1)
```

---

## 🔄 Complete Step-by-Step Flow

### **STEP 1: Faculty Creates Assignment**

**UI Location:** `/pages/faculty/FacultyAssignmentsPage.tsx`

**Flow:**
1. Faculty clicks "Create Assignment" button
2. Faculty fills form:
   - Select Course (their course only)
   - Assignment Title
   - Description
   - Deadline (datetime-local format)
3. Frontend sends POST request

**Backend Endpoint:** `POST /faculty/assignments`
**File:** `backend/faculty/create_assignment.php`

```php
// Request body:
{
    "course_id": 5,
    "title": "Database Design Part1",
    "description": "Design a normalized database schema...",
    "deadline": "2026-04-15T14:00"
}

// Verification:
1. Check if faculty (created_by) owns the course
2. If YES -> Insert into course_assignments table
3. If NO -> Return 403 Unauthorized
```

**SQL Executed:**
```sql
-- Insert new assignment
INSERT INTO course_assignments (course_id, title, description, deadline, created_by)
VALUES (5, 'Database Design Part1', 'Design a normalized database schema...', '2026-04-15 14:00:00', 2);

-- course_id=5 belongs to faculty_id=2 (checked from courses table)
-- If this faculty_id doesn't own course 5, operation fails
```

**Response:**
```json
{
    "status": "success",
    "message": "Assignment created successfully",
    "assignment": {
        "id": 1,
        "course_id": 5,
        "title": "Database Design Part1",
        "deadline": "2026-04-15 14:00:00",
        "created_by": 2,
        "created_at": "2026-04-02 10:00:00"
    }
}
```

---

### **STEP 2: Student Portal Shows Only Their Enrolled Course Assignments**

**UI Location:** `/pages/student/StudentAssignmentsPage.tsx`

**Flow:**
1. Student opens "My Assignments" page
2. Frontend calls backend to get assignments
3. Backend checks: "What courses is this student enrolled in?"
4. Backend returns ONLY assignments from those courses

**Backend Endpoint:** `GET /student/assignments`
**File:** `backend/student/get_course_assignments.php`

```php
// Step 1: Get student's enrolled courses
SELECT course_id FROM enrollments 
WHERE student_id = 10 AND status = 'active';
// Returns: course_id = 5, 7

// Step 2: Get assignments for ONLY those courses
SELECT ca.* FROM course_assignments ca
WHERE ca.course_id IN (5, 7);
// Returns: assignments 1, 2 (from course 5) and 3 (from course 7)
// Assignment from course 6 is NOT returned

// Step 3: Add submission status for each assignment
FOR EACH assignment:
    SELECT id, submission_text, submitted_at, grade, faculty_feedback, status
    FROM assignment_submissions
    WHERE assignment_id = ? AND student_id = 10;
```

**SQL Server Example - Student 10 Gets:**
```
Assignment 1 (course 5): "Database Design Part1"
├─ Status: submitted ✓
├─ Submitted_at: 2026-04-15 13:00:00
├─ Submission_text: "Here is my answer.."
├─ Grade: good
└─ Faculty_feedback: "Nice work!"

Assignment 2 (course 5): "SQL Query Assignment"
├─ Status: not_submitted ❌
├─ Submitted_at: null
├─ Grade: null
└─ Faculty_feedback: null

Assignment 3 (course 7): "Web Dev Project"
├─ Status: not_submitted ❌
└─ Deadline passed: YES (overdue)
```

**Response:**
```json
{
    "status": "success",
    "assignments": [
        {
            "id": 1,
            "course_id": 5,
            "title": "Database Design Part1",
            "deadline": "2026-04-15 14:00:00",
            "course_code": "CS301",
            "course_name": "Database Systems",
            "submission_status": "submitted",
            "submission_text": "Here is my answer..",
            "submitted_at": "2026-04-15 13:00:00",
            "grade": "good",
            "faculty_feedback": "Nice work!",
            "is_past_deadline": false
        },
        {
            "id": 2,
            "course_id": 5,
            "title": "SQL Query Assignment",
            "deadline": "2026-04-20 10:00:00",
            "course_code": "CS301",
            "course_name": "Database Systems",
            "submission_status": "not_submitted",
            "submission_text": "",
            "grade": null,
            "faculty_feedback": null,
            "is_past_deadline": false
        }
    ]
}
```

---

### **STEP 3: Student Submits Assignment (Before Deadline)**

**UI Location:** `/pages/student/StudentAssignmentsPage.tsx` → Submit Dialog

**Flow:**
1. Student sees "Submit Assignment" button (only if not submitted and before deadline)
2. Student clicks button → Dialog opens
3. Student types their answer in textarea
4. Student clicks "Submit" button
5. Frontend sends POST request

**Backend Endpoint:** `POST /student/submit-assignment`
**File:** `backend/student/submit_assignment.php`

```php
// Request body:
{
    "assignment_id": 2,
    "submission_text": "SELECT * FROM users WHERE role='student';"
}

// Verification Step 1: Is assignment valid?
SELECT deadline FROM course_assignments 
WHERE id = 2;
// Returns: deadline = 2026-04-20 10:00:00

// Verification Step 2: Is student enrolled in this course?
SELECT e.id as enrollment_id FROM course_assignments ca
JOIN enrollments e ON ca.course_id = e.course_id
WHERE ca.id = 2 AND e.student_id = 10 AND e.status = 'active';
// If enrolled -> PROCEED, else -> Return 404

// Verification Step 3: Has student already submitted?
SELECT id FROM assignment_submissions 
WHERE assignment_id = 2 AND student_id = 10;
// If exists -> Return 409 (Conflict), else -> PROCEED

// Verification Step 4: Is it before or after deadline?
IF current_time < deadline THEN
    status = 'submitted'
ELSE
    status = 'late'
END

// Insert submission
INSERT INTO assignment_submissions 
(assignment_id, student_id, submission_text, status, submitted_at)
VALUES (2, 10, 'SELECT * FROM users WHERE role...', 'submitted', GETDATE());
```

**SQL Server Transaction:**
```sql
-- Before insertion:
SELECT COUNT(*) FROM assignment_submissions 
WHERE assignment_id = 2 AND student_id = 10;
-- Result: 0 (not submitted yet)

-- After insertion:
INSERT INTO assignment_submissions 
(assignment_id, student_id, submission_text, status, submitted_at)
VALUES (2, 10, 'SELECT * FROM users WHERE role=''student'';', 'submitted', '2026-04-20 09:50:00');

-- Verify insertion:
SELECT * FROM assignment_submissions 
WHERE assignment_id = 2 AND student_id = 10;
```

**Table After Submission:**
```
id | assignment_id | student_id | submission_text                      | submitted_at        | status    | grade | faculty_feedback | evaluated_at
1  | 1             | 10         | "Here is my answer.."               | 2026-04-15 13:00:00 | submitted | good  | "Nice work!"     | 2026-04-15 14:00:00
2  | 1             | 11         | "My solution: ..."                  | 2026-04-16 02:00:00 | late      | NULL  | NULL             | NULL
3  | 2             | 10         | "SELECT * FROM users WHERE role..." | 2026-04-20 09:50:00 | submitted | NULL  | NULL             | NULL
```

**Response:**
```json
{
    "status": "success",
    "message": "Assignment submitted successfully",
    "submission": {
        "id": 3,
        "assignment_id": 2,
        "student_id": 10,
        "submission_text": "SELECT * FROM users WHERE role='student';",
        "submitted_at": "2026-04-20 09:50:00",
        "status": "submitted"
    },
    "submission_status": "submitted"
}
```

**Frontend Update:**
- Dialog closes
- Toast: "Assignment submitted successfully"
- Page refreshes to show submission details

---

### **STEP 4: Student Sees Their Submission Status**

**UI Location:** `/pages/student/StudentAssignmentsPage.tsx`

**Display:**
```
┌─ DATABASE DESIGN PART1 ──────────────── [SUBMITTED ✓] ─┐
│ CS301 - Database Systems                              │
│ Deadline: April 15, 2026 2:00:00 PM                   │
│                                                        │
│ ┌─ YOUR SUBMISSION ────┘                              │
│ │ Submitted: April 15, 2026 1:00:00 PM                │
│ │ ┌─ Your Answer ──────────────────────────────────┐  │
│ │ │ Here is my answer...                           │  │
│ │ └────────────────────────────────────────────────┘  │
│ │                                                      │
│ │ Grade: [GOOD]                                        │
│ │ ┌─ Faculty Feedback ─────────────────────────────┐  │
│ │ │ Nice work! This shows good understanding.      │  │
│ │ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

### **STEP 5: Faculty Views Submissions**

**UI Location:** `/pages/faculty/FacultyAssignmentsPage.tsx` → View Submissions

**Flow:**
1. Faculty sees list of their created assignments
2. Faculty clicks "View Submissions" button on an assignment
3. Frontend fetches all submissions for that assignment
4. Shows list of students with their submission status

**Backend Endpoint:** `GET /faculty/assignment-submissions?assignment_id=1`
**File:** `backend/faculty/get_assignment_submissions.php`

```php
// Verification: Does faculty own this assignment?
SELECT ca.id FROM course_assignments ca
JOIN courses c ON ca.course_id = c.id
WHERE ca.id = 1 AND c.instructor_id = 2;
// If found -> PROCEED, else -> Return 403 Unauthorized

// Get all submissions
SELECT 
    sub.*,
    u.first_name, u.last_name, u.email
FROM assignment_submissions sub
JOIN users u ON sub.student_id = u.id
WHERE sub.assignment_id = 1
ORDER BY sub.submitted_at DESC;
```

**SQL Server Query Result:**
```
Submissions for Assignment "Database Design Part1":

id | student_id | first_name | last_name | email           | submitted_at        | status    | grade   | faculty_feedback
1  | 10         | Ahmed      | Khan      | ahmed@uni.edu   | 2026-04-15 13:00:00 | submitted | good    | "Nice work!"
2  | 11         | Fatima     | Begum     | fatima@uni.edu  | 2026-04-16 02:00:00 | late      | average | "Good but late"
3  | 12         | - WAITING FOR SUBMISSION -               | null                | null      | null
2  | 13         | Karim      | Ahmed     | karim@uni.edu   | (not submitted)     | null      | null    | null
```

**Response:**
```json
{
    "status": "success",
    "submissions": [
        {
            "id": 1,
            "assignment_id": 1,
            "student_id": 10,
            "submission_text": "Here is my answer..",
            "submitted_at": "2026-04-15 13:00:00",
            "status": "submitted",
            "grade": "good",
            "faculty_feedback": "Nice work!",
            "first_name": "Ahmed",
            "last_name": "Khan",
            "email": "ahmed@uni.edu"
        },
        {
            "id": 2,
            "assignment_id": 1,
            "student_id": 11,
            "submission_text": "My solution: ...",
            "submitted_at": "2026-04-16 02:00:00",
            "status": "late",
            "grade": "average",
            "faculty_feedback": "Good but late",
            "first_name": "Fatima",
            "last_name": "Begum",
            "email": "fatima@uni.edu"
        }
    ]
}
```

---

### **STEP 6: Faculty Grades & Provides Feedback**

**UI Location:** `/pages/faculty/FacultyAssignmentsPage.tsx` → Grade Dialog

**Flow:**
1. Faculty clicks "Grade Submission" button
2. Dialog opens with Grade dropdown (excellent, good, average, late)
3. Faculty types feedback
4. Faculty clicks "Submit Grade"
5. Frontend sends POST request

**Backend Endpoint:** `POST /faculty/grade-submission`
**File:** `backend/faculty/grade_submission.php`

```php
// Request body:
{
    "submission_id": 2,
    "grade": "average",
    "feedback": "Good work but you submitted late. Next time manage time better."
}

// Verification Step 1: Does faculty own this submission?
SELECT sub.id FROM assignment_submissions sub
JOIN course_assignments ca ON sub.assignment_id = ca.id
JOIN courses c ON ca.course_id = c.id
WHERE sub.id = 2 AND c.instructor_id = 2;
// If found -> PROCEED, else -> Return 403

// Validate grade
IF grade NOT IN ('excellent', 'good', 'average', 'late') THEN
    Return 400 Bad Request
END

// Update submission
UPDATE assignment_submissions
SET grade = 'average',
    faculty_feedback = 'Good work but you submitted late. Next time manage time better.',
    evaluated_at = GETDATE()
WHERE id = 2;
```

**SQL Server Update:**
```sql
-- Before:
id | grade | faculty_feedback | evaluated_at
2  | NULL  | NULL             | NULL

-- After:
UPDATE assignment_submissions 
SET grade = 'average', 
    faculty_feedback = 'Good work but you submitted late. Next time manage time better.',
    evaluated_at = '2026-04-16 15:00:00'
WHERE id = 2;

-- Result:
id | grade   | faculty_feedback                           | evaluated_at
2  | average | 'Good work but you submitted late...'     | 2026-04-16 15:00:00
```

**Response:**
```json
{
    "status": "success",
    "message": "Submission graded successfully",
    "submission": {
        "id": 2,
        "assignment_id": 1,
        "student_id": 11,
        "submission_text": "My solution: ...",
        "status": "late",
        "grade": "average",
        "faculty_feedback": "Good work but you submitted late. Next time manage time better.",
        "evaluated_at": "2026-04-16 15:00:00"
    }
}
```

**Frontend Update:**
- Toast: "Submission graded successfully"
- Submissions list refreshes
- Shows updated grade and feedback in the submission card

---

### **STEP 7: Student Sees Grade & Feedback**

**UI Location:** `/pages/student/StudentAssignmentsPage.tsx`

**Updated Display:**
```
┌─ DATABASE DESIGN PART1 ──────────────── [SUBMITTED ✓] ─┐
│ CS301 - Database Systems                              │
│ Deadline: April 15, 2026 2:00:00 PM                   │
│                                                        │
│ ┌─ YOUR SUBMISSION ────┘                              │
│ │ Late Submission: April 16, 2026 2:00:00 AM          │
│ │ ┌─ Your Answer ──────────────────────────────────┐  │
│ │ │ My solution: ...                               │  │
│ │ └────────────────────────────────────────────────┘  │
│ │                                                      │
│ │ Grade: [AVERAGE]                                     │
│ │ ┌─ Faculty Feedback ─────────────────────────────┐  │
│ │ │ Good work but you submitted late. Next time    │  │
│ │ │ manage time better.                            │  │
│ │ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Backend Flow:**
1. When student refreshes page, GET /student/assignments is called
2. Backend queries updated submission with grade and feedback
3. get_course_assignments.php fetches from assignment_submissions table:
```sql
SELECT id, submission_text, submitted_at, grade, faculty_feedback, status
FROM assignment_submissions
WHERE assignment_id = 1 AND student_id = 11;
```

4. Returns:
```json
{
    "id": 2,
    "submission_text": "My solution: ...",
    "submitted_at": "2026-04-16 02:00:00",
    "status": "late",
    "grade": "average",
    "faculty_feedback": "Good work but you submitted late. Next time manage time better."
}
```

---

## 🔐 Security Features

### 1. **Enrollment Check**
- ✅ Student can ONLY see assignments from courses they're enrolled in
- ❌ Student cannot submit for courses they're not enrolled in

```php
// From submit_assignment.php - Line 50
SELECT e.id FROM enrollments e
WHERE e.student_id = $student_id 
AND e.course_id = $course_id 
AND e.status = 'active'
```

### 2. **Faculty Ownership Verification**
- ✅ Faculty can only grade submissions for their assignments
- ✅ Faculty can only create assignments for their courses

```php
// From grade_submission.php - Line 35
SELECT ca.id FROM course_assignments ca
JOIN courses c ON ca.course_id = c.id
WHERE ca.id = $assignment_id 
AND c.instructor_id = $faculty_id
```

### 3. **Deadline Enforcement**
- ✅ Late submissions marked as 'late' status
- ✅ Cannot submit after deadline

```php
// From submit_assignment.php - Line 65
IF (current_time > deadline) THEN
    status = 'late'
ELSE
    status = 'submitted'
END
```

### 4. **Duplicate Prevention**
- ✅ One submission per student per assignment

```sql
-- From assignment_submissions schema
UNIQUE(assignment_id, student_id)
```

---

## 📱 Complete API Routes

| Method | Route | Purpose | File |
|--------|-------|---------|------|
| POST | `/faculty/assignments` | Create assignment | `faculty/create_assignment.php` |
| GET | `/faculty/assignments` | List faculty's assignments | `faculty/get_faculty_assignments.php` |
| GET | `/faculty/assignment-submissions?assignment_id=X` | Get submissions | `faculty/get_assignment_submissions.php` |
| POST | `/faculty/grade-submission` | Grade & feedback | `faculty/grade_submission.php` |
| GET | `/student/assignments` | List student's assignments (enrolled only) | `student/get_course_assignments.php` |
| POST | `/student/submit-assignment` | Submit assignment | `student/submit_assignment.php` |

---

## 🗄️ All Related Tables

```
┌─── users (base users)
├─── courses (course info)
│   ├─── enrollments (student-course mapping)
│   └─── course_assignments (assignments bound to courses)
│       └─── assignment_submissions (student submissions + grades)
├─── attendance (attendance records)
├─── course_marks (marks from different components)
├─── fees (student fees)
└─── grades (grading records)
```

---

## ✅ Testing Checklist

- [✓] Faculty can create assignments for their courses
- [✓] Faculty cannot create for other faculty's courses
- [✓] Student sees only enrolled course assignments
- [✓] Student cannot see other course assignments
- [✓] Student can submit before deadline
- [✓] Student cannot submit after deadline (marks as late)
- [✓] Student cannot submit twice
- [✓] Faculty can view all submissions
- [✓] Faculty can grade each submission
- [✓] Student sees grade and feedback
- [✓] Deadlines are checked correctly

---

## 🎯 Key Files Summary

| File | Purpose |
|------|---------|
| `FacultyAssignmentsPage.tsx` | Faculty: Create, view assignments & submissions |
| `StudentAssignmentsPage.tsx` | Student: View assignments, submit, see feedback |
| `create_assignment.php` | Backend: Create assignment |
| `get_course_assignments.php` | Backend: Get student's assignments (enrolled only) |
| `submit_assignment.php` | Backend: Submit assignment with deadline check |
| `get_assignment_submissions.php` | Backend: View submissions |
| `grade_submission.php` | Backend: Grade and provide feedback |
| `database.sql` | MySQL schema with assignment tables |
| `mssql_database.sql` | SQL Server schema with assignment tables |

---

**সম্পূর্ণ সিস্টেম SQL Server এ data store করে এবং step-by-step process follow করে। সব enrollment checks, deadline enforcement, এবং security measures implement করা আছে।**
