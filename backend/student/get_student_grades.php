<?php
require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT c.name AS course, g.grade, g.grade_point, g.assessment_type, g.recorded_at FROM grades g JOIN enrollments e ON g.enrollment_id = e.id JOIN courses c ON e.course_id = c.id WHERE e.student_id = ? ORDER BY g.recorded_at DESC');
    $stmt->execute([$student_id]);
    $grades = $stmt->fetchAll();
    echo json_encode(['grades' => $grades]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
