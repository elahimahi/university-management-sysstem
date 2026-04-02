<?php
/**
 * Comprehensive Debug Script
 * GET /debug/diagnose
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

$debug = [];

try {
    // ====== STEP 1: Check Tables Exist ======
    $debug['step_1'] = ['title' => 'Check Tables Exist'];
    
    $tables = ['users', 'courses', 'enrollments', 'course_assignments', 'assignment_submissions'];
    $table_status = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ? AND TABLE_SCHEMA = 'dbo'");
        $stmt->execute([$table]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            try {
                $stmt = $pdo->prepare("SELECT TOP 1 1 FROM $table");
                $stmt->execute();
                $table_status[$table] = 'EXISTS';
            } catch (Exception $e) {
                $table_status[$table] = 'MISSING';
            }
        } else {
            $table_status[$table] = 'EXISTS';
        }
    }
    
    $debug['step_1']['tables'] = $table_status;
    
    // ====== STEP 2: Count Records in Each Table ======
    $debug['step_2'] = ['title' => 'Count Records'];
    
    $counts = [];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM $table");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $counts[$table] = intval($result['cnt']);
        } catch (Exception $e) {
            $counts[$table] = 'ERROR: ' . $e->getMessage();
        }
    }
    
    $debug['step_2']['record_counts'] = $counts;
    
    // ====== STEP 3: List All Courses ======
    $debug['step_3'] = ['title' => 'All Courses'];
    
    try {
        $stmt = $pdo->prepare("SELECT c.id, c.code, c.name, c.instructor_id, u.first_name, u.last_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id");
        $stmt->execute();
        $debug['step_3']['courses'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $debug['step_3']['error'] = $e->getMessage();
    }
    
    // ====== STEP 4: List All Enrollments ======
    $debug['step_4'] = ['title' => 'All Enrollments'];
    
    try {
        $stmt = $pdo->prepare("SELECT e.id, e.student_id, e.course_id, u.first_name, u.last_name, c.code FROM enrollments e JOIN users u ON e.student_id = u.id JOIN courses c ON e.course_id = c.id WHERE e.status = 'active'");
        $stmt->execute();
        $debug['step_4']['enrollments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $debug['step_4']['error'] = $e->getMessage();
    }
    
    // ====== STEP 5: List All Assignments ======
    $debug['step_5'] = ['title' => 'All Course Assignments'];
    
    try {
        $stmt = $pdo->prepare("SELECT ca.id, ca.course_id, ca.title, ca.deadline, ca.created_by, c.code, u.email FROM course_assignments ca JOIN courses c ON ca.course_id = c.id JOIN users u ON ca.created_by = u.id");
        $stmt->execute();
        $debug['step_5']['assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $debug['step_5']['error'] = $e->getMessage();
    }
    
    // ====== STEP 6: Test Query for Student 10 ======
    $debug['step_6'] = ['title' => 'Test Query for Student ID 10'];
    
    try {
        // Get enrolled courses
        $stmt = $pdo->prepare("SELECT course_id FROM enrollments WHERE student_id = 10 AND status = 'active'");
        $stmt->execute();
        $courses_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $debug['step_6']['enrolled_courses'] = $courses_data;
        
        if (count($courses_data) > 0) {
            $courseIds = array_column($courses_data, 'course_id');
            $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
            
            $sql = "
                SELECT ca.id, ca.course_id, ca.title, ca.description, ca.deadline, ca.created_by,
                       c.code as course_code, c.name as course_name
                FROM course_assignments ca
                JOIN courses c ON ca.course_id = c.id
                WHERE ca.course_id IN ($placeholders)
                ORDER BY ca.deadline DESC
            ";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($courseIds);
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $debug['step_6']['assignments_found'] = count($assignments);
            $debug['step_6']['assignments'] = $assignments;
        } else {
            $debug['step_6']['message'] = 'Student 10 has no enrolled courses';
        }
    } catch (Exception $e) {
        $debug['step_6']['error'] = $e->getMessage();
        $debug['step_6']['trace'] = $e->getTraceAsString();
    }
    
    // ====== STEP 7: Check PHP Errors ======
    $debug['step_7'] = ['title' => 'PHP Configuration'];
    $debug['step_7']['php_version'] = phpversion();
    $debug['step_7']['pdo_drivers'] = PDO::getAvailableDrivers();
    
    http_response_code(200);
    echo json_encode($debug, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
