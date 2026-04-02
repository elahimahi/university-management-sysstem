<?php
require_once __DIR__ . '/db_connect.php';

try {
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM sms_logs');
    $result = $stmt->fetch();
    echo json_encode(['success' => true, 'total' => $result['total']]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>