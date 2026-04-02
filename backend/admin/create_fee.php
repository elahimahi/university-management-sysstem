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

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$student_ids = $data['student_ids'] ?? [];
$description = $data['description'] ?? null;
$amount = $data['amount'] ?? null;
$due_date = $data['due_date'] ?? null;

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
            $insert_stmt = $pdo->prepare('
                INSERT INTO fees (student_id, description, amount, due_date, status)
                VALUES (?, ?, ?, CAST(? AS DATE), ?)
            ');
            $insert_stmt->execute([$student_id, $description, (float)$amount, $due_date, 'pending']);
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
