<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT c.name AS course, g.grade, g.points as grade_point, g.semester, g.assigned_at as recorded_at FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.student_id = ? ORDER BY g.assigned_at DESC');

    $stmt->execute([$student_id]);
    $grades = $stmt->fetchAll();
    echo json_encode(['grades' => $grades]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
