<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    $stmt = $pdo->query("
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
    ");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['users_columns' => $columns], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
