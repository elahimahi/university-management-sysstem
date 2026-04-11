<?php
require_once __DIR__ . '/../core/db_connect.php';

try {
    // Check if message_type column exists
    $sql = "
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'admin_notifications' AND COLUMN_NAME = 'message_type'
    ";
    $stmt = $pdo->query($sql);
    $exists = $stmt->fetch();

    if (!$exists) {
        // Add message_type and message columns if they don't exist
        $alterSql = "
            ALTER TABLE admin_notifications 
            ADD message_type VARCHAR(50) DEFAULT 'payment',
                message VARCHAR(500) NULL
        ";
        $pdo->exec($alterSql);
        echo json_encode(['status' => 'success', 'message' => 'Columns added']);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Columns already exist']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
