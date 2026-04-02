<?php
/**
 * Get Assignment Submissions Endpoint
 * GET /faculty/assignment-submissions?assignment_id={id}
 *
 * Returns all submissions for a specific assignment.
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

$assignmentId = isset($_GET['assignment_id']) ? (int)$_GET['assignment_id'] : null;

if (!$assignmentId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Assignment ID is required']);
    exit();
}

try {
    // Check if assignment belongs to faculty's course
    $stmt = $pdo->prepare("
        SELECT ca.id
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        WHERE ca.id = ? AND c.instructor_id = ?
    ");
    $stmt->execute([$assignmentId, $user['id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only view submissions for your own assignments']);
        exit();
    }

    // Get submissions with student info
    $stmt = $pdo->prepare("
        SELECT 
            sub.*, 
            u.first_name, 
            u.last_name, 
            u.email,
            e.student_id
        FROM assignment_submissions sub
        JOIN enrollments e ON sub.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        WHERE sub.assignment_id = ?
        ORDER BY sub.submitted_at DESC
    ");
    $stmt->execute([$assignmentId]);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'submissions' => $submissions,
        'total' => count($submissions)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>