<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data['code'] || !$data['name'] || !isset($data['instructor_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Required fields: code, name, instructor_id']);
        exit;
    }

    // Check if course code already exists
    $checkQuery = "SELECT id FROM courses WHERE code = ?";
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute([$data['code']]);

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Course code already exists']);
        exit;
    }

    $insertQuery = "
        INSERT INTO courses (code, name, credits, category, level, instructor_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, GETDATE())
    ";

    $stmt = $pdo->prepare($insertQuery);
    $result = $stmt->execute([
        $data['code'],
        $data['name'],
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id']
    ]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Course created successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create course']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
