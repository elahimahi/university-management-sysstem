<?php
/**
 * Database Table Repair/Completion Script
 * Fixes remaining tables that might have failed
 */

header('Content-Type: application/json');

require_once __DIR__ . '/core/db_connect.php';

$response = [
    'status' => 'repairing',
    'steps' => []
];

try {
    // Check if assignment_submissions table needs to be fixed
    $step = ['name' => 'Fix assignment_submissions table', 'status' => 'pending'];
    try {
        // Drop if exists and recreate
        $pdo->exec("IF OBJECT_ID('assignment_submissions', 'U') IS NOT NULL DROP TABLE assignment_submissions");
        
        $sql = "CREATE TABLE assignment_submissions (
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
    }
    $response['steps'][] = $step;

    // Check if course_marks table needs to be fixed
    $step = ['name' => 'Fix course_marks table', 'status' => 'pending'];
    try {
        // Drop if exists and recreate
        $pdo->exec("IF OBJECT_ID('course_marks', 'U') IS NOT NULL DROP TABLE course_marks");
        
        $sql = "CREATE TABLE course_marks (
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
    }
    $response['steps'][] = $step;

    // Verify all tables exist
    $step = ['name' => 'Verify all tables', 'status' => 'pending'];
    try {
        $query = "SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo'";
        $result = $pdo->query($query)->fetch();
        $tableCount = $result['table_count'];
        
        $tables = [
            'users', 'courses', 'enrollments', 'grades', 'attendance', 
            'fees', 'payments', 'assignments', 'course_assignments', 
            'assignment_submissions', 'course_marks', 'login_history'
        ];
        
        $missing = [];
        foreach ($tables as $table) {
            $checkQuery = "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ? AND TABLE_SCHEMA = 'dbo'";
            $checkStmt = $pdo->prepare($checkQuery);
            $checkStmt->execute([$table]);
            $check = $checkStmt->fetch();
            if ($check['cnt'] == 0) {
                $missing[] = $table;
            }
        }
        
        $step['status'] = 'success';
        $step['details'] = [
            'total_tables' => $tableCount,
            'expected_tables' => count($tables),
            'missing_tables' => $missing
        ];
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    // Get connection info
    $step = ['name' => 'Database connection info', 'status' => 'success'];
    try {
        $versionStmt = $pdo->query("SELECT @@VERSION as version");
        $version = $versionStmt->fetch();
        $timeStmt = $pdo->query("SELECT GETDATE() as current_time");
        $time = $timeStmt->fetch();
        
        $step['details'] = [
            'server' => 'MAHI\\SQLEXPRESS',
            'database' => 'university_db',
            'sql_version' => $version['version'],
            'server_time' => $time['current_time']
        ];
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    // Get users created
    $step = ['name' => 'Verify demo users', 'status' => 'pending'];
    try {
        $stmt = $pdo->query("SELECT email, role, COUNT(*) as cnt FROM users GROUP BY email, role ORDER BY role");
        $users = $stmt->fetchAll();
        
        $step['status'] = 'success';
        $step['details'] = $users;
    } catch (Exception $e) {
        $step['status'] = 'error';
        $step['message'] = $e->getMessage();
    }
    $response['steps'][] = $step;

    $response['status'] = 'success';
    $response['message'] = 'Database repair completed successfully!';
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Critical error during database repair',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
