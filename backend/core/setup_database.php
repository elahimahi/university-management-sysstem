<?php
/**
 * MS SQL Server Database Setup Script
 * Initializes the university_db database with all required tables
 * 
 * This script should be run once to set up the database schema.
 * After running this, the backend will be ready to use.
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    // Check if tables already exist
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'users'");
    $result = $stmt->fetch();
    $tableExists = $result['count'] > 0;

    if ($tableExists) {
        http_response_code(200);
        echo json_encode([
            'status' => 'info',
            'message' => 'Database tables already exist. Setup complete.',
            'database' => 'university_db',
            'server' => 'MAHI\SQLEXPRESS'
        ]);
        exit;
    }

    // Create all tables
    $sqlScript = "
    -- 1. Users Table with Approval Status
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
        phone VARCHAR(20) DEFAULT NULL,
        profile_picture VARCHAR(255) DEFAULT NULL,
        approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
        approved_by INT DEFAULT NULL,
        rejection_reason VARCHAR(255) DEFAULT NULL,
        is_email_verified BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Users_ApprovedBy FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
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

    -- 7. Course Assignments Table
    CREATE TABLE course_assignments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        description TEXT,
        deadline DATETIME2 NOT NULL,
        created_by INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_CourseAssignments_Courses FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 8. Assignments (Student Submissions) Table
    CREATE TABLE assignments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        course_assignment_id INT,
        student_id INT NOT NULL,
        submission_text TEXT,
        submission_file VARCHAR(255),
        self_rating INT DEFAULT 0,
        faculty_rating INT DEFAULT NULL,
        faculty_feedback TEXT,
        submitted_at DATETIME2,
        evaluated_at DATETIME2 DEFAULT NULL,
        CONSTRAINT FK_Assignments_CourseAssignments FOREIGN KEY (course_assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
        CONSTRAINT FK_Assignments_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 9. Payments Table
    CREATE TABLE payments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255) UNIQUE,
        paid_at DATETIME2 DEFAULT GETDATE(),
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        CONSTRAINT FK_Payments_Users FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 10. Login History Table
    CREATE TABLE login_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        login_time DATETIME2 DEFAULT GETDATE(),
        ip_address VARCHAR(45),
        user_agent TEXT,
        CONSTRAINT FK_LoginHistory_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ";

    // Execute the SQL script line by line
    $statements = array_filter(array_map('trim', explode(';', $sqlScript)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Database schema created successfully',
        'database' => 'university_db',
        'server' => 'MAHI\SQLEXPRESS',
        'tables_created' => 10,
        'next_step' => 'Call /admin/init-demo to create sample data'
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database setup failed: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}
?>
