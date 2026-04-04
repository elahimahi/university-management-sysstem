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
