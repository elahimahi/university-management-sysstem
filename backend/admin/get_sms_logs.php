<?php
require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

try {
    // Get SMS logs with pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;

    // Get total count
    $count_stmt = $pdo->query('SELECT COUNT(*) as total FROM sms_logs');
    $total = $count_stmt->fetch()['total'];

    // Get SMS logs
    $stmt = $pdo->prepare('
        SELECT id, phone_number, message, sms_type, sent_at, status, provider, created_at
        FROM sms_logs
        ORDER BY COALESCE(sent_at, created_at) DESC, id DESC
        OFFSET ? ROWS
        FETCH NEXT ? ROWS ONLY
    ');
    $stmt->bindParam(1, $offset, PDO::PARAM_INT);
    $stmt->bindParam(2, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll();

    // Get statistics
    $stats_stmt = $pdo->query("
        SELECT
            COUNT(*) as total_sms,
            SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_sms,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_sms,
            COUNT(DISTINCT phone_number) as unique_recipients
        FROM sms_logs
    ");
    $stats = $stats_stmt->fetch();

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'stats' => $stats,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch SMS logs',
        'details' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => $e->getFile()
    ]);
}
?>