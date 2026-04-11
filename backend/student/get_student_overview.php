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

// Get student ID from request (e.g., via token or POST)
$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    // GPA calculation
    $stmt = $pdo->prepare('SELECT AVG(points) AS gpa FROM grades WHERE student_id = ?');
    $stmt->execute([$student_id]);
    $gpa = $stmt->fetchColumn() ?: 0.00;

    // Credits earned
    $stmt = $pdo->prepare('SELECT SUM(c.credits) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = ? AND e.status = "completed"');
    $stmt->execute([$student_id]);
    $credits = $stmt->fetchColumn() ?: 0;

    // Attendance
    $stmt = $pdo->prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) AS present FROM attendance WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id = ?)');
    $stmt->execute([$student_id]);
    $row = $stmt->fetch();
    $attendance = $row['total'] ? round(($row['present'] / $row['total']) * 100, 2) : 0;

    // Fees
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM fees WHERE student_id = ? AND status != "paid"');
    $stmt->execute([$student_id]);
    $pending_fees = $stmt->fetchColumn();

    // Deadlines (next 5)
    $stmt = $pdo->prepare('SELECT description, due_date FROM fees WHERE student_id = ? AND status = "pending" ORDER BY due_date ASC LIMIT 5');
    $stmt->execute([$student_id]);
    $deadlines = $stmt->fetchAll();

    echo json_encode([
        'gpa' => number_format($gpa, 2),
        'credits' => (int)$credits,
        'attendance' => $attendance,
        'pending_fees' => (int)$pending_fees,
        'deadlines' => $deadlines
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
