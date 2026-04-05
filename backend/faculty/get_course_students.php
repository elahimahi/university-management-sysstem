<?php
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

try {
    $course_id = $_GET['course_id'] ?? null;

    if (!$course_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Course ID is required']);
        exit;
    }

    // Get students enrolled in this specific course
    $query = "
        SELECT 
            e.id as enrollment_id,
            u.id as student_id,
            u.first_name,
            u.last_name,
            (u.first_name + ' ' + u.last_name) as name,
            u.email,
            e.enrolled_at,
            e.status
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        WHERE e.course_id = :course_id AND u.role = 'student' AND e.status = 'active'
        ORDER BY u.last_name, u.first_name ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['course_id' => $course_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $students,
        'total' => count($students)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
