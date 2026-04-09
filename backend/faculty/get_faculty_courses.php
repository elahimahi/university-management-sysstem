<?php
/**
 * Get Faculty Courses Endpoint
 * GET /faculty/courses
 * 
 * Returns all courses taught by the authenticated faculty member.
 */

// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
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