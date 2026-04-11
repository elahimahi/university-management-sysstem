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
$validGrades = ['excellent', 'good', 'average', 'poor'];
if (!in_array($grade, $validGrades)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid grade. Must be one of: excellent, good, average, poor']);
    exit();
}

try {
    // Check if submission exists and get enrollment_id and student_id
    $stmt = $pdo->prepare("
        SELECT sub.id, sub.enrollment_id, e.student_id
        FROM assignment_submissions sub
        JOIN enrollments e ON sub.enrollment_id = e.id
        JOIN course_assignments ca ON sub.assignment_id = ca.id
        JOIN courses c ON ca.course_id = c.id
        WHERE sub.id = ? AND c.instructor_id = ?
    ");
    $stmt->execute([$submissionId, $user['id']]);
    $submissionMeta = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$submissionMeta) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only grade submissions for your own assignments']);
        exit();
    }

    $enrollmentId = (int)$submissionMeta['enrollment_id'];
    $studentId = (int)$submissionMeta['student_id'];

    // Update submission using correct column names matching the database schema
    $stmt = $pdo->prepare("UPDATE assignment_submissions SET feedback_status = ?, feedback_notes = ?, feedback_at = GETDATE() WHERE id = ?");
    $stmt->execute([$grade, $feedback, $submissionId]);

    // Get faculty name
    $facultyStmt = $pdo->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
    $facultyStmt->execute([$user['id']]);
    $facultyData = $facultyStmt->fetch(PDO::FETCH_ASSOC);
    $facultyFirstName = $facultyData['first_name'] ?? '';
    $facultyLastName = $facultyData['last_name'] ?? '';
    $facultyName = trim("$facultyFirstName $facultyLastName");

    // Create a student notification for the grade update with faculty name
    try {
        $notificationStmt = $pdo->prepare('INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, ?, ?, ?, ?, ?)');
        $notificationStmt->execute([
            $studentId,
            'student',
            $user['id'],
            "Your assignment submission has been graded {$grade} by {$facultyName}.",
            'grade_submission',
            'unread'
        ]);
    } catch (PDOException $notifError) {
        error_log('Student grade notification error: ' . $notifError->getMessage());
    }

    // Create a faculty notification for grading the submission
    try {
        $facultyNotifStmt = $pdo->prepare('INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, ?, ?, ?, ?, ?)');
        $facultyNotifStmt->execute([
            $user['id'],
            'faculty',
            $user['id'],
            "You have graded an assignment submission with grade: {$grade}.",
            'grade_submission',
            'unread'
        ]);
    } catch (PDOException $notifError) {
        error_log('Faculty grade notification error: ' . $notifError->getMessage());
    }

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