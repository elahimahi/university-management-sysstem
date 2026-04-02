<?php
/**
 * Debug endpoint to test student info
 * GET /debug/test-auth
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

header('Content-Type: application/json');

$user = getAuthenticatedUser();

if (!$user) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Not authenticated',
        'headers' => getallheaders(),
        'server_auth' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'
    ]);
    exit;
}

try {
    // Get student info
    $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE id = ?");
    $stmt->execute([$user]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get enrolled courses
    $stmt = $pdo->prepare("SELECT course_id FROM enrollments WHERE student_id = ? AND status = 'active'");
    $stmt->execute([$user]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $courseIds = array_column($courses, 'course_id');
    
    // Test the query
    $assignments = [];
    if (count($courseIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
        $sql = "
            SELECT ca.id, ca.course_id, ca.title, ca.description, ca.deadline
            FROM course_assignments ca
            WHERE ca.course_id IN ($placeholders)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($courseIds);
        $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'status' => 'success',
        'user' => $student,
        'enrolled_courses_count' => count($courseIds),
        'enrolled_course_ids' => $courseIds,
        'assignments_found' => count($assignments),
        'assignments' => array_slice($assignments, 0, 3)  // First 3 only
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}
?>
