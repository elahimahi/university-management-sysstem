<?php
/**
 * Admin - Create new fee for student(s)
 * POST /admin/create-fee
 * 
 * Request body:
 * {
 *   "student_ids": [1, 2, 3],  // array of student IDs or null for all students
 *   "description": "Tuition Fee",
 *   "amount": 5000,
 *   "due_date": "2026-04-17"
 * }
 */

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

$student_ids = $data['student_ids'] ?? [];
$description = $data['description'] ?? null;
$amount = $data['amount'] ?? null;
$due_date = $data['due_date'] ?? null;
$status = $data['status'] ?? 'pending';

if (!$description || $amount === null || !$due_date) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: description, amount, due_date']);
    exit;
}

try {
    // If no specific students, get all students
    if (empty($student_ids)) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE role = ?');
        $stmt->execute(['student']);
        $students = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $student_ids = $students;
    }

    if (empty($student_ids)) {
        http_response_code(400);
        echo json_encode(['error' => 'No students found']);
        exit;
    }

    $successful = 0;
    $failed = 0;
    $errors = [];

    foreach ($student_ids as $student_id) {
        try {
            // Insert fee with payment deadline
            $insert_stmt = $pdo->prepare('
                INSERT INTO fees (student_id, description, amount, due_date, status)
                VALUES (?, ?, ?, CAST(? AS DATE), ?)
            ');
            $insert_stmt->execute([$student_id, $description, (float)$amount, $due_date, $status]);
            $fee_id = $pdo->lastInsertId();

            $successful++;
        } catch (Exception $e) {
            $failed++;
            $errors[] = "Failed to create fee for student $student_id: " . $e->getMessage();
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Fees created: $successful successful, $failed failed",
        'successful' => $successful,
        'failed' => $failed,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
