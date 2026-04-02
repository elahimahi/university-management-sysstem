<?php
/**
 * Grade Submission Endpoint
 * POST /faculty/grade-submission
 *
 * Allows faculty to grade a submission.
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
$requiredFields = ['submission_id', 'grade'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
        exit();
    }
}

$submissionId = (int)$data['submission_id'];
$grade = trim($data['grade']);
$feedback = isset($data['feedback']) ? trim($data['feedback']) : null;

// Validate grade
$validGrades = ['excellent', 'good', 'average', 'late'];
if (!in_array($grade, $validGrades)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid grade. Must be one of: excellent, good, average, late']);
    exit();
}

try {
    // Check if submission belongs to faculty's assignment
    $stmt = $pdo->prepare("
        SELECT sub.id
        FROM assignment_submissions sub
        JOIN course_assignments ca ON sub.assignment_id = ca.id
        JOIN courses c ON ca.course_id = c.id
        WHERE sub.id = ? AND c.instructor_id = ?
    ");
    $stmt->execute([$submissionId, $user['id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only grade submissions for your own assignments']);
        exit();
    }

    // Update submission using correct column names
    $stmt = $pdo->prepare("UPDATE assignment_submissions SET feedback_status = ?, feedback_notes = ?, feedback_at = GETDATE() WHERE id = ?");
    $stmt->execute([$grade, $feedback, $submissionId]);

    // Get updated submission
    $stmt = $pdo->prepare("SELECT * FROM assignment_submissions WHERE id = ?");
    $stmt->execute([$submissionId]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Submission graded successfully',
        'submission' => $submission
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>