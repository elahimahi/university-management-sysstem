<?php
/**
 * Create admin_notifications table if it doesn't exist
 */

require_once __DIR__ . '/core/db_connect.php';

try {
    // Check if table exists
    $check_stmt = $pdo->query("
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'admin_notifications'
    ");
    
    if ($check_stmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'admin_notifications table already exists'
        ]);
        exit;
    }

    // Create admin_notifications table
    $sql = "
        CREATE TABLE admin_notifications (
            id INT IDENTITY(1,1) PRIMARY KEY,
            student_id INT NOT NULL,
            fee_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(50),
            fee_description VARCHAR(255),
            transaction_id VARCHAR(100) NULL,
            CONSTRAINT UQ_AdminNotifications_TransactionId UNIQUE (transaction_id),
            status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
            created_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_AdminNotifications_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT FK_AdminNotifications_Fees FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE
        )
    ";
    
    $pdo->exec($sql);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'admin_notifications table created successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
