-- Database: university_db
CREATE DATABASE IF NOT EXISTS university_db;
USE university_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
    phone VARCHAR(20) DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    category VARCHAR(100),
    level VARCHAR(20),
    instructor_id INT,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Enrollments Table (Many-to-Many between Students and Courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id, semester)
);

-- 4. Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    grade VARCHAR(5),
    grade_point DECIMAL(3, 2),
    assessment_type VARCHAR(50), -- e.g., 'Assignment', 'Quiz', 'Final'
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') DEFAULT 'present',
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE(enrollment_id, date)
);

-- 6. Fees Table
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    submission_text TEXT,
    self_rating INT DEFAULT 0,
    faculty_rating INT DEFAULT NULL,
    faculty_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluated_at TIMESTAMP NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- 8b. Course Assignments Table
CREATE TABLE IF NOT EXISTS course_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    deadline DATETIME NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 8c. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('submitted', 'late') DEFAULT 'submitted',
    faculty_feedback TEXT,
    grade VARCHAR(20),
    evaluated_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(assignment_id, student_id)
);

-- 9. Course Marks Table (for storing attendance marks, participation, and other course-related marks)
CREATE TABLE IF NOT EXISTS course_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    course_id INT NOT NULL,
    attendance_marks DECIMAL(5, 2) DEFAULT 0,
    participation_marks DECIMAL(5, 2) DEFAULT 0,
    assignment_marks DECIMAL(5, 2) DEFAULT 0,
    mid_term_marks DECIMAL(5, 2) DEFAULT 0,
    final_marks DECIMAL(5, 2) DEFAULT 0,
    total_marks DECIMAL(6, 2) DEFAULT 0,
    max_marks DECIMAL(6, 2) DEFAULT 100,
    percentage DECIMAL(5, 2) DEFAULT 0,
    grade VARCHAR(5) DEFAULT NULL,
    remarks TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(enrollment_id, course_id)
);
