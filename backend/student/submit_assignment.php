<?php
/**
 * Submit Assignment Endpoint
 * POST /student/submit-assignment
 *
 * Allows students to submit an assignment.
 * Requires authentication and student role.
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated and is student
$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

if ($user['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Only students can submit assignments']);
    exit();
}

function tableExists(PDO $pdo, string $tableName): bool {
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?");
    $stmt->execute([$tableName]);
    return intval($stmt->fetchColumn() ?? 0) > 0;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
$requiredFields = ['assignment_id', 'submission_text'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
        exit();
    }
}

$assignmentId = (int)$data['assignment_id'];
$submissionText = trim($data['submission_text']);

try {
    // Check if assignment exists and student is enrolled in the course
    $stmt = $pdo->prepare("
            SELECT ca.deadline, e.id as enrollment_id
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            JOIN enrollments e ON c.id = e.course_id
            WHERE ca.id = ? AND e.student_id = ? AND e.status = 'active'
        ");
    $stmt->execute([$assignmentId, $user['id']]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$assignment) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Assignment not found or you are not enrolled in this course']);
        exit();
    }

    $enrollmentId = $assignment['enrollment_id'] ?? null;

    if (!tableExists($pdo, 'assignment_submissions')) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Submission storage is not available on this server']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id FROM assignment_submissions WHERE assignment_id = ? AND enrollment_id = ?");
    $stmt->execute([$assignmentId, $enrollmentId]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'You have already submitted this assignment']);
        exit();
    }

    // Check deadline
    $currentTime = date('Y-m-d H:i:s');
    if ($currentTime > $assignment['deadline']) {
        $isLate = 1;
    } else {
        $isLate = 0;
    }

    $stmt = $pdo->prepare("INSERT INTO assignment_submissions (assignment_id, enrollment_id, submission_text, is_late) VALUES (?, ?, ?, ?)");
    $stmt->execute([$assignmentId, $enrollmentId, $submissionText, $isLate]);

    $submissionId = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM assignment_submissions WHERE id = ?");
    $stmt->execute([$submissionId]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Assignment submitted successfully',
        'submission' => $submission,
        'submission_status' => $status
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>