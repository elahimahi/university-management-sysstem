<?php
/**
 * Initialize Notifications Table
 * Creates the notifications table if it doesn't exist
 * This is a migration script for existing databases
 */

header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Check if table exists
    $check_stmt = $pdo->query("
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'notifications'
    ");
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            'status' => 'info',
            'message' => 'notifications table already exists'
        ]);
        exit;
    }

    // Create notifications table
    $sql = "
        CREATE TABLE notifications (
            id INT IDENTITY(1,1) PRIMARY KEY,
            recipient_id INT NOT NULL,
            recipient_role VARCHAR(20) NOT NULL,
            actor_id INT NULL,
            message VARCHAR(500) NOT NULL,
            notification_type VARCHAR(50) DEFAULT 'general',
            status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
            created_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_Notifications_Recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT FK_Notifications_Actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE NO ACTION
        )
    ";
    
    $pdo->exec($sql);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'notifications table created successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create notifications table: ' . $e->getMessage()
    ]);
}
?>
