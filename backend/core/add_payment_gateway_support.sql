-- Add payment gateway support to database
-- Run this script to update the database schema

-- Add transaction_id column to payments table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('payments') AND name = 'transaction_id')
BEGIN
    ALTER TABLE payments ADD transaction_id VARCHAR(100) NULL;
END

-- Create payment_transactions table for gateway integration
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
        CONSTRAINT FK_PaymentTransactions_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_PaymentTransactions_Fees FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE
    );
END

-- Create index for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('payment_transactions') AND name = 'IX_PaymentTransactions_TransactionId')
BEGIN
    CREATE INDEX IX_PaymentTransactions_TransactionId ON payment_transactions(transaction_id);
END