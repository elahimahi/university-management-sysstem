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
    $faculty_id = $_GET['faculty_id'] ?? null;

    if (!$faculty_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Faculty ID is required']);
        exit;
    }

    // Get students enrolled in courses taught by this faculty
    $query = "
        SELECT DISTINCT
            u.id,
            u.name,
            u.email,
            u.student_id,
            e.status as enrollment_status,
            (SELECT COUNT(DISTINCT enrollment_id) FROM enrollments 
             WHERE student_id = u.id AND status = 'active') as course_count
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = :faculty_id AND u.role = 'student'
        ORDER BY u.name ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['faculty_id' => $faculty_id]);
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
