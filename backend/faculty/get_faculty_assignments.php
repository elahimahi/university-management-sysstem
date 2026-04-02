<?php
/**
 * Get Faculty Assignments Endpoint
 * GET /faculty/assignments
 *
 * Returns all assignments created by the faculty.
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

try {
    // Get assignments created by the faculty
    $stmt = $pdo->prepare("
        SELECT ca.id, ca.course_id, ca.title, ca.description, ca.deadline, ca.created_by, ca.created_at,
               c.code as course_code, c.name as course_name,
               (SELECT COUNT(*) FROM assignment_submissions sub WHERE sub.assignment_id = ca.id) as submission_count
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        WHERE ca.created_by = ?
        ORDER BY ca.created_at DESC
    ");
    $stmt->execute([$user['id']]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'assignments' => $assignments,
        'total' => count($assignments)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>