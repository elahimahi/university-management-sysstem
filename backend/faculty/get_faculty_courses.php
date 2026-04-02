<?php
/**
 * Get Faculty Courses Endpoint
 * GET /faculty/courses
 * 
 * Returns all courses taught by the authenticated faculty member.
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated
$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Authentication required',
        'debug' => 'No authenticated user found'
    ]);
    exit();
}

// Check if user is faculty
if ($user['role'] !== 'faculty') {
    http_response_code(403);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Only faculty members can access this resource',
        'userRole' => $user['role']
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, code, name, credits, category, level FROM courses WHERE instructor_id = ? ORDER BY name");
    $stmt->execute([$user['id']]);
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