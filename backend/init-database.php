<?php
/**
 * Complete Database Initialization Script
 * This script creates all necessary tables for the University Management System
 * Run via: http://localhost:5000/init-database.php
 */

header('Content-Type: application/json');

require_once __DIR__ . '/core/db_connect.php';

$response = [
    'status' => 'initializing',
    'steps' => [],
    'errors' => []
];

try {
    // Step 1: Create Users Table
    $step = ['name' => 'Create users table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('users', 'U') IS NULL
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
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 2: Create Courses Table
    $step = ['name' => 'Create courses table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('courses', 'U') IS NULL
        CREATE TABLE courses (
            id INT IDENTITY(1,1) PRIMARY KEY,
            code VARCHAR(20) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            credits INT NOT NULL,
            category VARCHAR(100),
            level VARCHAR(20),
            instructor_id INT,
            CONSTRAINT FK_Courses_Users FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 3: Create Enrollments Table
    $step = ['name' => 'Create enrollments table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('enrollments', 'U') IS NULL
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
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 4: Create Grades Table
    $step = ['name' => 'Create grades table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('grades', 'U') IS NULL
        CREATE TABLE grades (
            id INT IDENTITY(1,1) PRIMARY KEY,
            enrollment_id INT NOT NULL,
            grade VARCHAR(5),
            grade_point DECIMAL(3, 2),
            assessment_type VARCHAR(50),
            recorded_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_Grades_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 5: Create Attendance Table
    $step = ['name' => 'Create attendance table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('attendance', 'U') IS NULL
        CREATE TABLE attendance (
            id INT IDENTITY(1,1) PRIMARY KEY,
            enrollment_id INT NOT NULL,
            date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
            CONSTRAINT FK_Attendance_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
            CONSTRAINT UC_Enrollment_Date UNIQUE(enrollment_id, date)
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 6: Create Fees Table
    $step = ['name' => 'Create fees table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('fees', 'U') IS NULL
        CREATE TABLE fees (
            id INT IDENTITY(1,1) PRIMARY KEY,
            student_id INT NOT NULL,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            due_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
            CONSTRAINT FK_Fees_Users FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 7: Create Payments Table
    $step = ['name' => 'Create payments table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('payments', 'U') IS NULL
        CREATE TABLE payments (
            id INT IDENTITY(1,1) PRIMARY KEY,
            fee_id INT NOT NULL,
            student_id INT NOT NULL,
            amount_paid DECIMAL(10, 2) NOT NULL,
            payment_date DATETIME2 DEFAULT GETDATE(),
            payment_method VARCHAR(50),
            transaction_id VARCHAR(100) UNIQUE,
            status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
            notes TEXT,
            CONSTRAINT FK_Payments_Fees FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
            CONSTRAINT FK_Payments_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 8: Create Assignments Table
    $step = ['name' => 'Create assignments table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('assignments', 'U') IS NULL
        CREATE TABLE assignments (
            id INT IDENTITY(1,1) PRIMARY KEY,
            enrollment_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            submission_text TEXT,
            self_rating INT DEFAULT 0,
            faculty_rating INT DEFAULT NULL,
            faculty_feedback TEXT,
            submitted_at DATETIME2 DEFAULT GETDATE(),
            evaluated_at DATETIME2 NULL,
            CONSTRAINT FK_Assignments_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 9: Create Course Assignments Table
    $step = ['name' => 'Create course_assignments table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('course_assignments', 'U') IS NULL
        CREATE TABLE course_assignments (
            id INT IDENTITY(1,1) PRIMARY KEY,
            course_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            description TEXT,
            deadline DATETIME2 NOT NULL,
            created_by INT NOT NULL,
            created_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_CourseAssignments_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            CONSTRAINT FK_CourseAssignments_Users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 10: Create Assignment Submissions Table
    $step = ['name' => 'Create assignment_submissions table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('assignment_submissions', 'U') IS NULL
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
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 11: Create Course Marks Table
    $step = ['name' => 'Create course_marks table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('course_marks', 'U') IS NULL
        CREATE TABLE course_marks (
            id INT IDENTITY(1,1) PRIMARY KEY,
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
            last_updated DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_CourseMarks_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
            CONSTRAINT FK_CourseMarks_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            CONSTRAINT UC_Enrollment_Course_Marks UNIQUE(enrollment_id, course_id)
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 12: Create Login History Table
    $step = ['name' => 'Create login_history table', 'status' => 'pending'];
    try {
        $sql = "IF OBJECT_ID('login_history', 'U') IS NULL
        CREATE TABLE login_history (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            login_time DATETIME2 DEFAULT GETDATE(),
            logout_time DATETIME2 NULL,
            ip_address VARCHAR(50),
            user_agent VARCHAR(500),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
            CONSTRAINT FK_LoginHistory_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
        $step['status'] = 'success';
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
        $response['errors'][] = $step;
    }
    $response['steps'][] = $step;

    // Step 13: Create Demo Admin User
    $step = ['name' => 'Create demo admin user', 'status' => 'pending'];
    try {
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'admin'");
        $checkStmt->execute(['admin@university.edu']);
        $admin = $checkStmt->fetch();

        if (!$admin) {
            $hashedPassword = password_hash('Admin@123456', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute(['admin@university.edu', $hashedPassword, 'Admin', 'User', 'admin', 1]);
            $step['status'] = 'success';
            $step['details'] = 'Admin account created: admin@university.edu / Admin@123456';
        } else {
            $step['status'] = 'success';
            $step['details'] = 'Admin account already exists';
        }
    } catch (Exception $e) {
        $step['status'] = 'warning';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    // Step 14: Create Demo Faculty User
    $step = ['name' => 'Create demo faculty user', 'status' => 'pending'];
    try {
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'faculty'");
        $checkStmt->execute(['faculty@university.edu']);
        $faculty = $checkStmt->fetch();

        if (!$faculty) {
            $hashedPassword = password_hash('Faculty@123456', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute(['faculty@university.edu', $hashedPassword, 'Dr. John', 'Smith', 'faculty', 1]);
            $step['status'] = 'success';
            $step['details'] = 'Faculty account created: faculty@university.edu / Faculty@123456';
        } else {
            $step['status'] = 'success';
            $step['details'] = 'Faculty account already exists';
        }
    } catch (Exception $e) {
        $step['status'] = 'warning';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    // Step 15: Create Demo Student User
    $step = ['name' => 'Create demo student user', 'status' => 'pending'];
    try {
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'student'");
        $checkStmt->execute(['student@university.edu']);
        $student = $checkStmt->fetch();

        if (!$student) {
            $hashedPassword = password_hash('Student@123456', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute(['student@university.edu', $hashedPassword, 'John', 'Doe', 'student', 1]);
            $step['status'] = 'success';
            $step['details'] = 'Student account created: student@university.edu / Student@123456';
        } else {
            $step['status'] = 'success';
            $step['details'] = 'Student account already exists';
        }
    } catch (Exception $e) {
        $step['status'] = 'warning';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    $response['status'] = count($response['errors']) === 0 ? 'success' : 'completed_with_errors';
    $response['message'] = count($response['errors']) === 0 
        ? 'All tables created successfully!' 
        : 'Database initialization completed with some errors';
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Critical error during database initialization',
        'error' => $e->getMessage(),
        'steps_completed' => count($response['steps'])
    ], JSON_PRETTY_PRINT);
}
?>
