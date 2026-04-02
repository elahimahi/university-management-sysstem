<?php
require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

try {
    // Simple test query
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM sms_logs');
    $total = $stmt->fetch()['total'];

    echo json_encode([
        'success' => true,
        'total' => $total,
        'message' => 'SMS logs endpoint working'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch SMS logs',
        'details' => $e->getMessage()
    ]);
}
?>