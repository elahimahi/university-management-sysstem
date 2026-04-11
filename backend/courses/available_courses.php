<?php
/**
 * Get Available Courses Endpoint
 * GET /courses/available
 * 
 * Returns all available courses that students can enroll in.
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

// Check if user is authenticated (any role can view)
$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    $requestedSemester = isset($_GET['semester']) ? trim($_GET['semester']) : null;

    // Get student's current semester if no semester was requested
    $semesterStmt = $pdo->prepare("SELECT current_semester FROM users WHERE id = ?");
    $semesterStmt->execute([$user['id']]);
    $userData = $semesterStmt->fetch(PDO::FETCH_ASSOC);

    if (!$requestedSemester && (!$userData || !$userData['current_semester'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Student semester not set']);
        exit();
    }

    $selectedSemester = $requestedSemester ?: $userData['current_semester'];

    $semesterOptionsStmt = $pdo->prepare("SELECT DISTINCT semester FROM courses ORDER BY semester");
    $semesterOptionsStmt->execute();
    $semesterOptions = array_column($semesterOptionsStmt->fetchAll(PDO::FETCH_ASSOC), 'semester');

    // Get courses for the selected semester
    $stmt = $pdo->prepare("
        SELECT 
            c.id, 
            c.code, 
            c.name, 
            c.credits, 
            c.category, 
            c.level,
            c.semester,
            c.instructor_id,
            u.first_name,
            u.last_name,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.semester = ?
        ORDER BY c.code
    ");
    $stmt->execute([$selectedSemester]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'courses' => $courses,
        'semester_options' => $semesterOptions,
        'selected_semester' => $selectedSemester,
        'total' => count($courses)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
