<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['fee_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Fee ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM fees WHERE id = ?");
    $stmt->execute([$data['fee_id']]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Fee deleted successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
