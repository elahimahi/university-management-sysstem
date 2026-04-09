<?php
/**
 * Schema Update Script for Fees Payment Deadline & Penalty System
 * MS SQL Server
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    $updates = [];

    // 1. ALTER FEES TABLE - Add payment deadline and penalty columns
    try {
        $checkPaymentDeadline = $pdo->query("
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME='fees' AND COLUMN_NAME='payment_deadline'
        ");
        if ($checkPaymentDeadline->rowCount() === 0) {
            $pdo->exec("ALTER TABLE fees ADD payment_deadline DATETIME2 NULL, 
                                          penalty_applied BIT DEFAULT 0,
                                          penalty_amount DECIMAL(10, 2) DEFAULT 0");
            $updates[] = "✓ Added payment_deadline, penalty_applied, penalty_amount to fees table";
        } else {
            $updates[] = "⚠ fees table already has payment deadline columns";
        }
    } catch (Exception $e) {
        $updates[] = "✗ Error updating fees table: " . $e->getMessage();
    }

    // 2. UPDATE PAYMENTS TABLE - Add payment deadline reference
    try {
        $checkDeadlineRef = $pdo->query("
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME='payments' AND COLUMN_NAME='fee_id'
        ");
        if ($checkDeadlineRef->rowCount() === 0) {
            $pdo->exec("ALTER TABLE payments ADD fee_id INT");
            $updates[] = "✓ Added fee_id to payments table";
        } else {
            $updates[] = "⚠ payments table already linked to fees";
        }
    } catch (Exception $e) {
        $updates[] = "✗ Error updating payments table: " . $e->getMessage();
    }

    // 3. CREATE SMS_LOGS TABLE if not exists
    try {
        $checkSmsLogs = $pdo->query("
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='sms_logs'
        ");
        
        if ($checkSmsLogs->rowCount() === 0) {
            $pdo->exec("
                CREATE TABLE sms_logs (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    student_id INT,
                    phone_number VARCHAR(20) NOT NULL,
                    message TEXT NOT NULL,
                    sms_type VARCHAR(50), -- 'payment_confirmation', 'pending_reminder', 'penalty_notice'
                    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
                    provider VARCHAR(50), -- 'twilio', 'nexmo', 'bdesl', 'test'
                    sent_at DATETIME2 DEFAULT GETDATE(),
                    created_at DATETIME2 DEFAULT GETDATE(),
                    CONSTRAINT FK_SMSLogs_Students FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");
            $updates[] = "✓ Created sms_logs table";
        } else {
            $updates[] = "⚠ sms_logs table already exists";
        }
    } catch (Exception $e) {
        $updates[] = "✗ Error creating sms_logs table: " . $e->getMessage();
    }

    // 4. CREATE PENALTY_CONFIG TABLE
    try {
        $checkPenaltyConfig = $pdo->query("
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='penalty_config'
        ");
        
        if ($checkPenaltyConfig->rowCount() === 0) {
            $pdo->exec("
                CREATE TABLE penalty_config (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    fee_id INT NOT NULL,
                    penalty_percentage DECIMAL(5, 2) DEFAULT 5, -- % of fee amount
                    penalty_flat_amount DECIMAL(10, 2) DEFAULT 0,
                    penalty_type VARCHAR(20) DEFAULT 'percentage' CHECK (penalty_type IN ('percentage', 'flat', 'combined')),
                    apply_after_days INT DEFAULT 7, -- days after deadline to apply penalty
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_by INT,
                    CONSTRAINT FK_PenaltyConfig_Fees FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
                    CONSTRAINT FK_PenaltyConfig_Users FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
                )
            ");
            $updates[] = "✓ Created penalty_config table";
        } else {
            $updates[] = "⚠ penalty_config table already exists";
        }
    } catch (Exception $e) {
        $updates[] = "✗ Error creating penalty_config table: " . $e->getMessage();
    }

    // 5. CREATE PAYMENT_DEADLINE_LOG TABLE for audit trail
    try {
        $checkDeadlineLog = $pdo->query("
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='payment_deadline_log'
        ");
        
        if ($checkDeadlineLog->rowCount() === 0) {
            $pdo->exec("
                CREATE TABLE payment_deadline_log (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    fee_id INT NOT NULL,
                    old_deadline DATETIME2,
                    new_deadline DATETIME2,
                    changed_by INT NOT NULL,
                    reason VARCHAR(255),
                    changed_at DATETIME2 DEFAULT GETDATE(),
                    CONSTRAINT FK_DeadlineLog_Fees FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
                    CONSTRAINT FK_DeadlineLog_Users FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
                )
            ");
            $updates[] = "✓ Created payment_deadline_log table";
        } else {
            $updates[] = "⚠ payment_deadline_log table already exists";
        }
    } catch (Exception $e) {
        $updates[] = "✗ Error creating payment_deadline_log table: " . $e->getMessage();
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Database schema updated successfully',
        'updates' => $updates
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database update failed: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}
?>
