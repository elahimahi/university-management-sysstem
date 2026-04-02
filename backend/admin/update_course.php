<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Course ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE courses 
        SET code = ?, name = ?, credits = ?, category = ?, level = ?, instructor_id = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['code'] ?? null,
        $data['name'] ?? null,
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id'] ?? null,
        $data['id']
    ]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course updated successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
