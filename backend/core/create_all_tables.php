<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

try {
    echo "Creating missing tables...\n\n";

    // 1. Courses Table
    try {
        $pdo->exec("
            CREATE TABLE courses (
                id INT IDENTITY(1,1) PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                credits INT NOT NULL DEFAULT 3,
                category VARCHAR(100),
                level VARCHAR(20),
                instructor_id INT,
                semester VARCHAR(20),
                created_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Courses_Instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            )
        ");
        echo "✓ Created courses table\n";
    } catch (Exception $e) {
        echo "⚠ courses table: " . $e->getMessage() . "\n";
    }

    // 2. Enrollments Table
    try {
        $pdo->exec("
            CREATE TABLE enrollments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                semester VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
                enrolled_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Enrollments_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT FK_Enrollments_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                CONSTRAINT UQ_Enrollment UNIQUE(student_id, course_id, semester)
            )
        ");
        echo "✓ Created enrollments table\n";
    } catch (Exception $e) {
        echo "⚠ enrollments table: " . $e->getMessage() . "\n";
    }

    // 3. Grades Table
    try {
        $pdo->exec("
            CREATE TABLE grades (
                id INT IDENTITY(1,1) PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                grade VARCHAR(2),
                points DECIMAL(3, 2),
                semester VARCHAR(50) NOT NULL,
                assigned_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Grades_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT FK_Grades_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                CONSTRAINT UQ_Grade UNIQUE(student_id, course_id, semester)
            )
        ");
        echo "✓ Created grades table\n";
    } catch (Exception $e) {
        echo "⚠ grades table: " . $e->getMessage() . "\n";
    }

    // 4. Fees Table
    try {
        $pdo->exec("
            CREATE TABLE fees (
                id INT IDENTITY(1,1) PRIMARY KEY,
                student_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                due_date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
                paid_at DATETIME2 DEFAULT NULL,
                semester VARCHAR(50),
                created_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Fees_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        echo "✓ Created fees table\n";
    } catch (Exception $e) {
        echo "⚠ fees table: " . $e->getMessage() . "\n";
    }

    // 5. Attendance Table
    try {
        $pdo->exec("
            CREATE TABLE attendance (
                id INT IDENTITY(1,1) PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                attendance_date DATE NOT NULL,
                status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late')),
                CONSTRAINT FK_Attendance_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT FK_Attendance_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                CONSTRAINT UQ_Attendance UNIQUE(student_id, course_id, attendance_date)
            )
        ");
        echo "✓ Created attendance table\n";
    } catch (Exception $e) {
        echo "⚠ attendance table: " . $e->getMessage() . "\n";
    }

    // 6. Assignments Table
    try {
        $pdo->exec("
            CREATE TABLE assignments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                due_date DATETIME2 NOT NULL,
                total_marks INT DEFAULT 10,
                created_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Assignment_Course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        ");
        echo "✓ Created assignments table\n";
    } catch (Exception $e) {
        echo "⚠ assignments table: " . $e->getMessage() . "\n";
    }

    // 7. Submissions Table
    try {
        $pdo->exec("
            CREATE TABLE submissions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                submission_text TEXT,
                file_path VARCHAR(255),
                marks_obtained INT,
                submitted_at DATETIME2 DEFAULT GETDATE(),
                CONSTRAINT FK_Submission_Assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                CONSTRAINT FK_Submission_Student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        echo "✓ Created submissions table\n";
    } catch (Exception $e) {
        echo "⚠ submissions table: " . $e->getMessage() . "\n";
    }

    // 8. Add sample data for testing
    echo "\nAdding sample data...\n";

    // Add sample student if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM users WHERE email='student@university.edu'");
    $stmt->execute();
    if ($stmt->fetch()['cnt'] == 0) {
        $pwd = password_hash('student123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) 
            VALUES (?,?,?,?,?,?,?)
        ");
        $stmt->execute(['student@university.edu', $pwd, 'John', 'Doe', 'student', 1, 'approved']);
        echo "✓ Created sample student user\n";
    }

    // Add sample course
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM courses WHERE code='CS101'");
    $stmt->execute();
    if ($stmt->fetch()['cnt'] == 0) {
        $stmt = $pdo->prepare("
            INSERT INTO courses (code, name, credits, level, semester) 
            VALUES (?,?,?,?,?)
        ");
        $stmt->execute(['CS101', 'Introduction to Programming', 3, '100', 'Spring 2026']);
        echo "✓ Created sample course\n";
        
        // Get course id
        $courseStmt = $pdo->query("SELECT id FROM courses WHERE code='CS101'");
        $courseId = $courseStmt->fetch()['id'];
        
        // Enroll student
        $studentStmt = $pdo->query("SELECT id FROM users WHERE email='student@university.edu'");
        $studentId = $studentStmt->fetch()['id'];
        
        $stmt = $pdo->prepare("
            INSERT INTO enrollments (student_id, course_id, semester, status) 
            VALUES (?,?,?,?)
        ");
        $stmt->execute([$studentId, $courseId, 'Spring 2026', 'active']);
        echo "✓ Enrolled student in course\n";
        
        // Add sample grade
        $stmt = $pdo->prepare("
            INSERT INTO grades (student_id, course_id, grade, points, semester) 
            VALUES (?,?,?,?,?)
        ");
        $stmt->execute([$studentId, $courseId, 'A', 4.0, 'Spring 2026']);
        echo "✓ Added sample grade\n";
    }

    http_response_code(200);
    echo "\n✓ All tables created successfully!\n";
    echo "✓ Sample data added for testing\n";

} catch (PDOException $e) {
    http_response_code(500);
    echo "✗ Error: " . $e->getMessage();
}
?>
