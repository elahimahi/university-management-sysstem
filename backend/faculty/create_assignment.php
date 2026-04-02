<?php
/**
 * Create Assignment Endpoint
 * POST /faculty/assignments
 *
 * Allows faculty to create a new assignment for their course.
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
$requiredFields = ['course_id', 'title', 'description', 'deadline'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
        exit();
    }
}

$courseId = (int)$data['course_id'];
$title = trim($data['title']);
$description = trim($data['description']);
$deadline = trim($data['deadline']);

// Convert deadline format from datetime-local (2026-04-01T14:30) to SQL format
// If it contains 'T', convert to space, then add :00 if needed
if (strpos($deadline, 'T') !== false) {
    $deadline = str_replace('T', ' ', $deadline);
    if (strlen($deadline) === 16) { // YYYY-MM-DD HH:MM
        $deadline .= ':00'; // Add seconds
    }
}

// Validate deadline format
if (!strtotime($deadline)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid deadline format. Received: ' . $deadline]);
    exit();
}

try {
    // Check if course exists and belongs to the faculty
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ? AND instructor_id = ?");
    $stmt->execute([$courseId, $user['id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only create assignments for your own courses']);
        exit();
    }

    // Insert new assignment
    $stmt = $pdo->prepare("INSERT INTO course_assignments (course_id, title, description, deadline, created_by) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$courseId, $title, $description, $deadline, $user['id']]);

    $assignmentId = $pdo->lastInsertId();

    // Get the inserted assignment
    $stmt = $pdo->prepare("SELECT * FROM course_assignments WHERE id = ?");
    $stmt->execute([$assignmentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Assignment created successfully',
        'assignment' => $assignment
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('Assignment creation error: ' . $e->getMessage() . ' | SQL State: ' . $e->getCode());
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage(), 'code' => $e->getCode()]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Assignment creation general error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>