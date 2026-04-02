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
    $stmt = $pdo->prepare('SELECT c.name AS course, a.date, a.status FROM attendance a JOIN enrollments e ON a.enrollment_id = e.id JOIN courses c ON e.course_id = c.id WHERE e.student_id = ? ORDER BY a.date DESC');
    $stmt->execute([$student_id]);
    $attendance = $stmt->fetchAll();
    echo json_encode(['attendance' => $attendance]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
