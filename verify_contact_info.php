<?php
/**
 * Verify that contact info is being stored correctly
 * Check both payment_transactions and payments tables
 */

require_once __DIR__ . '/backend/core/db_connect.php';

echo "=== Verification: Contact Info Storage ===\n\n";

try {
    // Check payment_transactions table structure
    echo "1. Checking payment_transactions columns:\n";
    $stmt = $pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payment_transactions' AND COLUMN_NAME LIKE '%contact%'");
    $stmt->execute();
    $cols = $stmt->fetchAll();
    if (count($cols) > 0) {
        foreach ($cols as $col) {
            echo "   ✓ " . $col['COLUMN_NAME'] . " (" . $col['DATA_TYPE'] . ")\n";
        }
    } else {
        echo "   ✗ No contact info column found!\n";
    }
    
    echo "\n2. Checking payments table columns:\n";
    $stmt = $pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME LIKE '%contact%'");
    $stmt->execute();
    $cols = $stmt->fetchAll();
    if (count($cols) > 0) {
        foreach ($cols as $col) {
            echo "   ✓ " . $col['COLUMN_NAME'] . " (" . $col['DATA_TYPE'] . ")\n";
        }
    } else {
        echo "   ✗ No contact info column found!\n";
    }
    
    echo "\n3. Checking recent payment_transactions with contact_info:\n";
    $stmt = $pdo->prepare("SELECT TOP 5 transaction_id, payment_method, contact_info FROM payment_transactions ORDER BY created_at DESC");
    $stmt->execute();
    $rows = $stmt->fetchAll();
    if (count($rows) > 0) {
        foreach ($rows as $row) {
            echo "   Transaction: " . $row['transaction_id'] . "\n";
            echo "   Method: " . $row['payment_method'] . "\n";
            echo "   Contact: " . ($row['contact_info'] ? $row['contact_info'] : '[empty]') . "\n";
            echo "   ---\n";
        }
    } else {
        echo "   No transactions found\n";
    }
    
    echo "\n4. Checking recent payments with phone_or_account:\n";
    $stmt = $pdo->prepare("SELECT TOP 5 id, transaction_id, payment_method, phone_or_account FROM payments ORDER BY payment_date DESC");
    $stmt->execute();
    $rows = $stmt->fetchAll();
    if (count($rows) > 0) {
        foreach ($rows as $row) {
            echo "   Payment ID: " . $row['id'] . "\n";
            echo "   Transaction: " . ($row['transaction_id'] ? $row['transaction_id'] : '[none]') . "\n";
            echo "   Method: " . $row['payment_method'] . "\n";
            echo "   Contact: " . ($row['phone_or_account'] ? $row['phone_or_account'] : '[empty]') . "\n";
            echo "   ---\n";
        }
    } else {
        echo "   No payments found\n";
    }
    
    echo "\n✓ Schema verification complete!\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
