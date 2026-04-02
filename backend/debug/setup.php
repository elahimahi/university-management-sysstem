<?php
/**
 * Setup Script: Create Tables and Test Data
 * GET /debug/setup
 * SQL Server Version
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

$results = [];

try {
    // ====== DROP EXISTING TABLES ======
    $result = ['step' => 'Drop existing tables'];
    try {
        // Drop with IF EXISTS for SQL Server
        $pdo->exec("IF OBJECT_ID('assignment_submissions', 'U') IS NOT NULL DROP TABLE assignment_submissions");
        $pdo->exec("IF OBJECT_ID('course_assignments', 'U') IS NOT NULL DROP TABLE course_assignments");
        
        $result['status'] = 'SUCCESS';
        $result['message'] = 'Dropped existing tables';
    } catch (Exception $e) {
        $result['status'] = 'WARNING';
        $result['message'] = 'Tables may not have existed: ' . $e->getMessage();
    }
    $results[] = $result;
    
    // ====== CREATE course_assignments TABLE ======
    $result = ['step' => 'Create course_assignments table'];
    try {
        $pdo->exec("
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
        )
        ");
        
        $result['status'] = 'SUCCESS';
        $result['message'] = 'course_assignments table created';
    } catch (Exception $e) {
        $result['status'] = 'ERROR';
        $result['message'] = $e->getMessage();
    }
    $results[] = $result;
    
    // ====== CREATE assignment_submissions TABLE ======
    $result = ['step' => 'Create assignment_submissions table'];
    try {
        $pdo->exec("
        CREATE TABLE assignment_submissions (
            id INT IDENTITY(1,1) PRIMARY KEY,
            assignment_id INT NOT NULL,
            student_id INT NOT NULL,
            submission_text TEXT,
            submitted_at DATETIME2 DEFAULT GETDATE(),
            status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late')),
            faculty_feedback TEXT,
            grade VARCHAR(20) CHECK (grade IN ('excellent', 'good', 'average', 'late')),
            evaluated_at DATETIME2 NULL,
            CONSTRAINT FK_Submissions_Assignments FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
            CONSTRAINT FK_Submissions_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT UC_Assignment_Student UNIQUE(assignment_id, student_id)
        )
        ");
        
        $result['status'] = 'SUCCESS';
        $result['message'] = 'assignment_submissions table created';
    } catch (Exception $e) {
        $result['status'] = 'ERROR';
        $result['message'] = $e->getMessage();
    }
    $results[] = $result;
    
    // ====== INSERT TEST DATA ======
    $result = ['step' => 'Insert test assignments'];
    try {
        // First check if we have courses and users
        $stmt = $pdo->prepare("SELECT TOP 1 id, instructor_id FROM courses");
        $stmt->execute();
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($course) {
            $course_id = $course['id'];
            $faculty_id = $course['instructor_id'];
            
            if ($faculty_id) {
                // Insert test assignments using SQL Server syntax
                $sql = "
                INSERT INTO course_assignments (course_id, title, description, deadline, created_by)
                VALUES 
                (" . intval($course_id) . ", 'Database Design Project', 'Design a normalized database schema', DATEADD(DAY, 7, GETDATE()), " . intval($faculty_id) . "),
                (" . intval($course_id) . ", 'SQL Query Assignment', 'Write complex SQL queries', DATEADD(DAY, 10, GETDATE()), " . intval($faculty_id) . "),
                (" . intval($course_id) . ", 'Database Optimization', 'Index and optimize queries', DATEADD(DAY, 14, GETDATE()), " . intval($faculty_id) . ")
                ";
                $pdo->exec($sql);
                
                $result['status'] = 'SUCCESS';
                $result['message'] = 'Test assignments inserted';
                $result['course_id'] = $course_id;
                $result['faculty_id'] = $faculty_id;
            } else {
                $result['status'] = 'WARNING';
                $result['message'] = 'Found course but no instructor assigned yet';
            }
        } else {
            $result['status'] = 'WARNING';
            $result['message'] = 'No courses found in database';
        }
    } catch (Exception $e) {
        $result['status'] = 'ERROR';
        $result['message'] = $e->getMessage();
    }
    $results[] = $result;
    
    // ====== VERIFY SETUP ======
    $result = ['step' => 'Verify Setup'];
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM course_assignments");
        $stmt->execute();
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $result['status'] = 'SUCCESS';
        $result['assignments_count'] = intval($count['cnt']);
        $result['message'] = 'Setup complete';
    } catch (Exception $e) {
        $result['status'] = 'ERROR';
        $result['message'] = $e->getMessage();
    }
    $results[] = $result;
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Setup completed',
        'steps' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'steps' => $results
    ], JSON_PRETTY_PRINT);
}
?>
