<?php
/**
 * Run Payment Gateway Database Migration
 */

require_once __DIR__ . '/db_connect.php';

try {
    echo "Running payment gateway database migration...\n";

    // Add transaction_id column to payments table
    $sql1 = "
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'transaction_id')
    BEGIN
        ALTER TABLE payments ADD transaction_id VARCHAR(100) NULL;
        PRINT 'Added transaction_id column to payments table'
    END
    ELSE
    BEGIN
        PRINT 'transaction_id column already exists in payments table'
    END
    ";

    $pdo->exec($sql1);

    // Create payment_transactions table
    $sql2 = "
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payment_transactions' AND xtype='U')
    BEGIN
        CREATE TABLE payment_transactions (
            id INT IDENTITY(1,1) PRIMARY KEY,
            transaction_id VARCHAR(100) NOT NULL UNIQUE,
            student_id INT NOT NULL,
            fee_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('bkash', 'nagad', 'rocket', 'card')),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
            gateway_response NVARCHAR(MAX) NULL,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_PaymentTransactions_Students FOREIGN KEY (student_id) REFERENCES users(id),
            CONSTRAINT FK_PaymentTransactions_Fees FOREIGN KEY (fee_id) REFERENCES fees(id)
        );
        PRINT 'Created payment_transactions table'
    END
    ELSE
    BEGIN
        PRINT 'payment_transactions table already exists'
    END
    ";

    $pdo->exec($sql2);

    // Create index
    $sql3 = "
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('payment_transactions') AND name = 'IX_PaymentTransactions_TransactionId')
    BEGIN
        CREATE INDEX IX_PaymentTransactions_TransactionId ON payment_transactions(transaction_id);
        PRINT 'Created index on transaction_id'
    END
    ELSE
    BEGIN
        PRINT 'Index on transaction_id already exists'
    END
    ";

    $pdo->exec($sql3);

    // Ensure payments.transaction_id is unique
    $sql4 = "
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('payments') AND name = 'UQ_Payments_TransactionId')
    BEGIN
        CREATE UNIQUE INDEX UQ_Payments_TransactionId ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
        PRINT 'Created unique index on payments.transaction_id'
    END
    ELSE
    BEGIN
        PRINT 'Unique index on payments.transaction_id already exists'
    END
    ";
    $pdo->exec($sql4);

    // Ensure admin_notifications.transaction_id column exists and is unique
    $sql5 = "
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'transaction_id')
    BEGIN
        ALTER TABLE admin_notifications ADD transaction_id VARCHAR(100) NULL;
        PRINT 'Added transaction_id column to admin_notifications table'
    END
    ELSE
    BEGIN
        PRINT 'transaction_id column already exists in admin_notifications table'
    END
    ";
    $pdo->exec($sql5);

    $sql6 = "
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'UQ_AdminNotifications_TransactionId')
    BEGIN
        CREATE UNIQUE INDEX UQ_AdminNotifications_TransactionId ON admin_notifications(transaction_id) WHERE transaction_id IS NOT NULL;
        PRINT 'Created unique index on admin_notifications.transaction_id'
    END
    ELSE
    BEGIN
        PRINT 'Unique index on admin_notifications.transaction_id already exists'
    END
    ";
    $pdo->exec($sql6);

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>