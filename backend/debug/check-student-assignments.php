<?php
/**
 * Debug student assignments
 * GET /debug/check-student-assignments
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

header('Content-Type: application/json');

$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    // Get all course assignments for student's enrolled courses
    $stmt = $pdo->prepare("
        SELECT 
            ca.id,
            ca.title,
            ca.deadline,
            ca.course_id,
            c.code as course_code,
            c.name as course_name,
            CASE WHEN GETDATE() > ca.deadline THEN 1 ELSE 0 END as is_past_deadline,
            CASE WHEN asub.id IS NOT NULL THEN 'submitted' ELSE 'not_submitted' END as submission_status,
            asub.submitted_at,
            asub.id as submission_id
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN assignment_submissions asub ON asub.assignment_id = ca.id AND asub.enrollment_id = e.id
        WHERE e.student_id = ? AND e.status = 'active'
        ORDER BY ca.deadline ASC
    ");
    
    $stmt->execute([$user['id']]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'student_id' => $user['id'],
        'total_assignments' => count($assignments),
        'assignments' => $assignments
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
