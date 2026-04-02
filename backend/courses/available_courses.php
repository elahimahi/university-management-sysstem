<?php
/**
 * Get Available Courses Endpoint
 * GET /courses/available
 * 
 * Returns all available courses that students can enroll in.
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated (any role can view)
$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    // Get all courses with instructor information
    $stmt = $pdo->prepare("
        SELECT 
            c.id, 
            c.code, 
            c.name, 
            c.credits, 
            c.category, 
            c.level,
            c.instructor_id,
            u.first_name,
            u.last_name,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        ORDER BY c.code
    ");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'courses' => $courses,
        'total' => count($courses)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
