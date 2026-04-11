<?php
require_once __DIR__ . '/core/db_connect.php';

header('Content-Type: application/json');

// Get recent payment transactions
$stmt = $pdo->prepare('
    SELECT TOP 5
        transaction_id,
        student_id,
        fee_id,
        amount,
        payment_method,
        status,
        created_at
    FROM payment_transactions
    ORDER BY created_at DESC
');

$stmt->execute();
$transactions = $stmt->fetchAll();

echo json_encode([
    'recent_transactions' => $transactions,
    'total_count' => count($transactions)
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
