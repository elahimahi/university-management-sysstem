<?php
/**
 * Database Reset & Schema Migration
 * This script drops and recreates all tables with the correct schema
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    // Drop all tables in reverse dependency order with proper syntax
    $dropQueries = [
        "IF OBJECT_ID('dbo.enrollments', 'U') IS NOT NULL DROP TABLE dbo.enrollments;",
        "IF OBJECT_ID('dbo.courses', 'U') IS NOT NULL DROP TABLE dbo.courses;",
        "IF OBJECT_ID('dbo.fees', 'U') IS NOT NULL DROP TABLE dbo.fees;",
        "IF OBJECT_ID('dbo.grades', 'U') IS NOT NULL DROP TABLE dbo.grades;",
        "IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;",
    ];

    foreach ($dropQueries as $query) {
        try {
            $pdo->exec($query);
        } catch (PDOException $e) {
            error_log("Drop table notice: " . $e->getMessage());
        }
    }

    // Wait a moment for drops to complete
    usleep(500000);

    // Create tables with correct schema
    $createTablesSQL = "
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
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Courses_Users FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 3. Enrollments Table
    CREATE TABLE enrollments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        semester VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
        enrolled_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Enrollments_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Enrollments_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id, semester)
    );

    -- 4. Fees Table
    CREATE TABLE fees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
        paid_at DATETIME2 DEFAULT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Fees_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 5. Grades Table
    CREATE TABLE grades (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        grade VARCHAR(2) NOT NULL,
        points DECIMAL(3, 2) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        assigned_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Grades_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Grades_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id, semester)
    );
    ";

    // Execute each CREATE TABLE statement
    $statements = array_filter(array_map('trim', preg_split('/;/', $createTablesSQL)));
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }

    // Insert default admin user
    $adminEmail = 'admin@university.edu';
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $exists = $stmt->fetch()['count'] > 0;

    if (!$exists) {
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $adminEmail,
            $adminPassword,
            'Admin',
            'User',
            'admin',
            1,
            'approved'
        ]);
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Database reset and schema created successfully!',
        'tables_created' => ['users', 'courses', 'enrollments', 'fees', 'grades'],
        'default_admin' => ['email' => 'admin@university.edu', 'password' => 'admin123'],
        'note' => 'Change the admin password after first login!'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database reset failed: ' . $e->getMessage()
    ]);
    exit;
}
?>
