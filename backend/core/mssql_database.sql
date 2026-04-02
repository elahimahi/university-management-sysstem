-- Database: university_db
-- Use this script in SQL Server Management Studio (SSMS)

-- 1. Users Table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    phone VARCHAR(20) DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    is_email_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- 2. Courses Table
CREATE TABLE courses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    category VARCHAR(100),
    level VARCHAR(20),
    instructor_id INT,
    CONSTRAINT FK_Courses_Users FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Enrollments Table
CREATE TABLE enrollments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    enrolled_at DATETIME2 DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    CONSTRAINT FK_Enrollments_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Enrollments_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT UC_Student_Course_Semester UNIQUE(student_id, course_id, semester)
);

-- 4. Grades Table
CREATE TABLE grades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    grade VARCHAR(5),
    grade_point DECIMAL(3, 2),
    assessment_type VARCHAR(50), 
    recorded_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Grades_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- 5. Attendance Table
CREATE TABLE attendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
    CONSTRAINT FK_Attendance_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT UC_Enrollment_Date UNIQUE(enrollment_id, date)
);

-- 6. Fees Table
CREATE TABLE fees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    CONSTRAINT FK_Fees_Users FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Assignments Table
CREATE TABLE assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    submission_text TEXT,
    self_rating INT DEFAULT 0,
    faculty_rating INT DEFAULT NULL,
    faculty_feedback TEXT,
    submitted_at DATETIME2 DEFAULT GETDATE(),
    evaluated_at DATETIME2 DEFAULT NULL,
    CONSTRAINT FK_Assignments_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- 9. Course Assignments Table
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

-- 10. Assignment Submissions Table
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

-- 11. Course Marks Table (for storing attendance marks, participation, and other course-related marks)
CREATE TABLE course_marks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL,
    course_id INT NOT NULL,
    attendance_marks DECIMAL(5, 2) DEFAULT 0, -- marks obtained for attendance
    participation_marks DECIMAL(5, 2) DEFAULT 0, -- marks for participation
    assignment_marks DECIMAL(5, 2) DEFAULT 0, -- marks for assignments
    mid_term_marks DECIMAL(5, 2) DEFAULT 0, -- mid-term exam marks
    final_marks DECIMAL(5, 2) DEFAULT 0, -- final exam marks
    total_marks DECIMAL(6, 2) DEFAULT 0, -- total marks obtained
    max_marks DECIMAL(6, 2) DEFAULT 100, -- maximum marks for course
    percentage DECIMAL(5, 2) DEFAULT 0, -- percentage obtained
    grade VARCHAR(5) DEFAULT NULL, -- letter grade
    remarks TEXT, -- any additional remarks
    last_updated DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_CourseMarks_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT FK_CourseMarks_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT UC_Enrollment_Course_Marks UNIQUE(enrollment_id, course_id)
);

