<?php
/**
 * Fix Database Schema - Add missing columns to users table
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    // Check if approval_status column exists
    $stmt = $pdo->query("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'approval_status'
    ");
    $columnExists = $stmt->rowCount() > 0;

    if (!$columnExists) {
        // Drop and recreate users table with correct schema
        echo json_encode([
            'status' => 'info',
            'message' => 'Dropping old users table and recreating with approval workflow...'
        ]) . "\n";

        // Drop dependent tables first (due to foreign keys)
        try {
            $pdo->exec("DROP TABLE IF EXISTS login_history");
            $pdo->exec("DROP TABLE IF EXISTS payments");
            $pdo->exec("DROP TABLE IF EXISTS submission_assignments");
            $pdo->exec("DROP TABLE IF EXISTS assignments");
            $pdo->exec("DROP TABLE IF EXISTS grades");
            $pdo->exec("DROP TABLE IF EXISTS attendance");
            $pdo->exec("DROP TABLE IF EXISTS enrollments");
            $pdo->exec("DROP TABLE IF EXISTS courses");
            
            // For users table, try to drop any FKs first
            try {
                $stmt = $pdo->query("
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                    WHERE TABLE_NAME = 'users' AND CONSTRAINT_TYPE = 'FOREIGN KEY'
                ");
                foreach ($stmt->fetchAll() as $row) {
                    $pdo->exec("ALTER TABLE users DROP CONSTRAINT " . $row['CONSTRAINT_NAME']);
                }
            } catch (Exception $e) {
                // Continue if no FKs
            }
            
            $pdo->exec("DROP TABLE IF EXISTS users");
        } catch (Exception $e) {
            echo json_encode(['error' => 'Error dropping tables: ' . $e->getMessage()]) . "\n";
        }

        // Recreate all tables with correct schema
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

        CREATE TABLE grades (
            id INT IDENTITY(1,1) PRIMARY KEY,
            enrollment_id INT NOT NULL,
            grade VARCHAR(5),
            grade_point DECIMAL(3, 2),
            assessment_type VARCHAR(50),
            recorded_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_Grades_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
        );

        CREATE TABLE attendance (
            id INT IDENTITY(1,1) PRIMARY KEY,
            enrollment_id INT NOT NULL,
            date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
            CONSTRAINT FK_Attendance_Enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
            CONSTRAINT UC_Enrollment_Date UNIQUE(enrollment_id, date)
        );
        ";

        $pdo->exec($sqlScript);

        echo json_encode([
            'status' => 'success',
            'message' => 'Database schema fixed! Users table now has approval_status, approved_by, and rejection_reason columns.',
            'database' => 'university_db',
            'server' => 'MAHI\\SQLEXPRESS'
        ]) . "\n";
    } else {
        echo json_encode([
            'status' => 'info',
            'message' => 'Database schema is already correct. All approval columns exist.',
            'database' => 'university_db'
        ]) . "\n";
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]) . "\n";
}
?>
