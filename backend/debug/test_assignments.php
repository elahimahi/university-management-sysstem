<?php
/**
 * Debug Script: Test Assignments API
 * GET /debug/test-assignments
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // ============== TEST 1: Check Enrollments ==============
    echo "<!-- TEST 1: ENROLLMENTS -->\n";
    $stmt = $pdo->prepare("SELECT e.*, u.first_name, u.last_name, c.code as course_code FROM enrollments e JOIN users u ON e.student_id = u.id JOIN courses c ON e.course_id = c.id");
    $stmt->execute();
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'test' => 'Enrollments',
        'total_enrollments' => count($enrollments),
        'data' => $enrollments
    ], JSON_PRETTY_PRINT) . "\n\n";

    // ============== TEST 2: Check Courses ==============
    echo "<!-- TEST 2: COURSES -->\n";
    $stmt = $pdo->prepare("SELECT c.*, u.first_name, u.last_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'test' => 'Courses',
        'total_courses' => count($courses),
        'data' => $courses
    ], JSON_PRETTY_PRINT) . "\n\n";

    // ============== TEST 3: Check Course Assignments ==============
    echo "<!-- TEST 3: COURSE ASSIGNMENTS -->\n";
    $stmt = $pdo->prepare("SELECT ca.*, c.code as course_code, u.first_name, u.last_name FROM course_assignments ca JOIN courses c ON ca.course_id = c.id JOIN users u ON ca.created_by = u.id");
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'test' => 'Assignments',
        'total_assignments' => count($assignments),
        'data' => $assignments
    ], JSON_PRETTY_PRINT) . "\n\n";

    // ============== TEST 4: Check Assignment Submissions ==============
    echo "<!-- TEST 4: ASSIGNMENT SUBMISSIONS -->\n";
    $stmt = $pdo->prepare("
        SELECT 
            sub.*, 
            ca.title as assignment_title, 
            u.first_name, 
            u.last_name,
            e.student_id
        FROM assignment_submissions sub 
        JOIN course_assignments ca ON sub.assignment_id = ca.id 
        JOIN enrollments e ON sub.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
    ");
    $stmt->execute();
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'test' => 'Submissions',
        'total_submissions' => count($submissions),
        'data' => $submissions
    ], JSON_PRETTY_PRINT) . "\n\n";

    // ============== TEST 5: Test API for Student ID 10 ==============
    echo "<!-- TEST 5: API OUTPUT FOR STUDENT ID 10 -->\n";
    
    // Get student enrolled courses
    $stmt = $pdo->prepare("SELECT course_id FROM enrollments WHERE student_id = 10 AND status = 'active'");
    $stmt->execute();
    $courses_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'test' => 'Student 10 Enrolled Courses',
        'student_id' => 10,
        'enrolled_courses' => $courses_list
    ], JSON_PRETTY_PRINT) . "\n\n";

    if (count($courses_list) > 0) {
        $courseIds = array_column($courses_list, 'course_id');
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
        $assignments_for_10 = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'test' => 'Assignments for Student 10',
            'assignments_count' => count($assignments_for_10),
            'assignments' => $assignments_for_10
        ], JSON_PRETTY_PRINT) . "\n\n";
    }

    // ============== TEST 6: Database Tables Info ==============
    echo "<!-- TEST 6: DATABASE TABLES -->\n";
    $tables_to_check = ['enrollments', 'courses', 'course_assignments', 'assignment_submissions', 'users'];
    $table_info = [];
    
    foreach ($tables_to_check as $table) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM $table");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $table_info[$table] = $result['count'];
    }
    
    echo json_encode([
        'test' => 'Table Row Counts',
        'tables' => $table_info
    ], JSON_PRETTY_PRINT) . "\n\n";

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
