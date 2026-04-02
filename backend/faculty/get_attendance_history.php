<?php
/**
 * Get attendance history for a course
 * GET /faculty/attendance-history?course_id=1&limit=50
 */

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$course_id = $_GET['course_id'] ?? null;
$faculty_id = $_GET['faculty_id'] ?? null;
$limit = $_GET['limit'] ?? 50;

if (!$course_id || !$faculty_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters: course_id, faculty_id']);
    exit;
}

try {
    // Verify faculty is the instructor of this course
    $verify_stmt = $pdo->prepare('SELECT id FROM courses WHERE id = ? AND instructor_id = ?');
    $verify_stmt->execute([$course_id, $faculty_id]);
    if (!$verify_stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: You are not the instructor for this course']);
        exit;
    }

    // Get attendance history
    $stmt = $pdo->prepare('
        SELECT TOP ? 
            a.id,
            a.date,
            a.status,
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email,
            e.id as enrollment_id
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        WHERE e.course_id = ?
        ORDER BY a.date DESC, u.last_name, u.first_name
    ');
    $stmt->execute([(int)$limit, $course_id]);
    $records = $stmt->fetchAll();

    // Get statistics
    $stats_stmt = $pdo->prepare('
        SELECT 
            a.date,
            COUNT(*) as total,
            SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN a.status = \'absent\' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN a.status = \'late\' THEN 1 ELSE 0 END) as late
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        WHERE e.course_id = ?
        GROUP BY a.date
        ORDER BY a.date DESC
    ');
    $stats_stmt->execute([$course_id]);
    $date_stats = $stats_stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'records' => $records,
        'date_statistics' => $date_stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
