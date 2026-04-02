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
    $stmt = $pdo->prepare('SELECT description, due_date FROM fees WHERE student_id = ? AND status = "pending" ORDER BY due_date ASC LIMIT 5');
    $stmt->execute([$student_id]);
    $deadlines = $stmt->fetchAll();
    echo json_encode(['deadlines' => $deadlines]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
