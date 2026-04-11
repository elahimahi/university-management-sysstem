<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    $pdo->exec("IF OBJECT_ID('notifications', 'U') IS NULL CREATE TABLE notifications (
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
    )");

    echo json_encode(['success' => true, 'message' => 'Notifications table created or already exists']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>