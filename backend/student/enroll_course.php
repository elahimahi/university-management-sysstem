<?php
/**
 * Student Course Enrollment Endpoint
 * POST /student/enroll
 * 
 * Allows a student to enroll in a course for the current semester.
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

// Check if user is authenticated and is a student
$user = requireStudentAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (!isset($data['course_id']) || empty($data['course_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Course ID is required']);
    exit();
}

if (!isset($data['semester']) || empty($data['semester'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Semester is required']);
    exit();
}

$course_id = (int)$data['course_id'];
$semester = trim($data['semester']);
$student_id = $user['id'];

try {
    // Check if course exists
    $stmt = $pdo->prepare("SELECT id, name FROM courses WHERE id = ?");
    $stmt->execute([$course_id]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Course not found']);
        exit();
    }

    // Check if student is already enrolled in this course for this semester
    $stmt = $pdo->prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND semester = ?");
    $stmt->execute([$student_id, $course_id, $semester]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'You are already enrolled in this course']);
        exit();
    }

    // Enroll student in course
    $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id, semester, status) VALUES (?, ?, ?, 'active')");
    $stmt->execute([$student_id, $course_id, $semester]);

    $enrollment_id = $pdo->lastInsertId();

    // Get the enrollment details
    $stmt = $pdo->prepare("
        SELECT 
            e.id,
            e.student_id,
            e.course_id,
            e.semester,
            e.enrolled_at,
            e.status,
            c.code,
            c.name,
            c.credits,
            u.first_name,
            u.last_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE e.id = ?
    ");
    $stmt->execute([$enrollment_id]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully enrolled in course',
        'enrollment' => $enrollment
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
