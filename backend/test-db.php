<?php
header("Content-Type: application/json");
require_once __DIR__ . '/core/db_connect.php';

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'users_count' => $result['count']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
}
?>
