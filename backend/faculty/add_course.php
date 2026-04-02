<?php
/**
 * Add Course Endpoint
 * POST /faculty/courses
 * 
 * Allows faculty to add a new course.
 * Requires authentication and faculty role.
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated and is faculty
$user = requireFacultyAuth();

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
$requiredFields = ['code', 'name', 'credits'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
        exit();
    }
}

$code = trim($data['code']);
$name = trim($data['name']);
$credits = (int)$data['credits'];
$category = isset($data['category']) ? trim($data['category']) : null;
$level = isset($data['level']) ? trim($data['level']) : null;

// Validate credits
if ($credits < 1 || $credits > 6) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Credits must be between 1 and 6']);
    exit();
}

try {
    // Check if course code already exists
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE code = ?");
    $stmt->execute([$code]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Course code already exists']);
        exit();
    }

    // Insert new course
    $stmt = $pdo->prepare("INSERT INTO courses (code, name, credits, category, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$code, $name, $credits, $category, $level, $user['id']]);

    $courseId = $pdo->lastInsertId();

    // Get the inserted course
    $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course added successfully',
        'course' => $course
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>