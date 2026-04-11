<?php
/**
 * Update Course Enrollment Status
 * POST /student/update-status
 * 
 * Allows marking a course as completed or dropping it.
 * For testing/admin purposes only.
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Get authenticated user
$user = getAuthenticatedUser();

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
if (!isset($data['enrollment_id']) || empty($data['enrollment_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Enrollment ID is required']);
    exit();
}

if (!isset($data['status']) || !in_array($data['status'], ['active', 'completed', 'dropped'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Valid status required (active, completed, dropped)']);
    exit();
}

$enrollment_id = (int)$data['enrollment_id'];
$new_status = $data['status'];

try {
    // Check enrollment exists and belongs to user
    $stmt = $pdo->prepare("SELECT id, student_id FROM enrollments WHERE id = ?");
    $stmt->execute([$enrollment_id]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$enrollment) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Enrollment not found']);
        exit();
    }

    // Verify ownership (student or admin/faculty)
    if ($enrollment['student_id'] != $user['id'] && $user['role'] !== 'admin' && $user['role'] !== 'faculty') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit();
    }

    // Update enrollment status
    $stmt = $pdo->prepare("UPDATE enrollments SET status = ? WHERE id = ?");
    $stmt->execute([$new_status, $enrollment_id]);

    // Get updated enrollment details
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
    $updated_enrollment = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course status updated to ' . ucfirst($new_status),
        'enrollment' => $updated_enrollment
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
