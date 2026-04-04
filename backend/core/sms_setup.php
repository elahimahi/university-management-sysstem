<?php
/**
 * SMS Setup and Database Migration
 * Creates necessary tables for SMS logging
 * Run this once to set up the database
 */

require_once __DIR__ . '/db_connect.php';

try {
    // Drop and recreate SMS logs table so the schema is always correct
    $sms_table_sql = "
    IF OBJECT_ID('sms_logs', 'U') IS NOT NULL
        DROP TABLE sms_logs;

    CREATE TABLE sms_logs (
        id INT PRIMARY KEY IDENTITY(1,1),
        student_id INT NULL,
        phone_number VARCHAR(20) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        sms_type VARCHAR(50),
        sent_at DATETIME,
        status VARCHAR(20) DEFAULT 'sent',
        provider VARCHAR(20) DEFAULT 'test',
        delivery_status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT GETDATE()
    )
    ";
    
    $pdo->exec($sms_table_sql);
    echo json_encode(['success' => true, 'message' => 'SMS logs table created/verified']);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
