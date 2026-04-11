<?php
require_once 'backend/core/db_connect.php';
$stmt = $pdo->query('SELECT id, student_id, amount, description FROM fees');
while ($row = $stmt->fetch()) {
    $total_paid_stmt = $pdo->prepare('SELECT SUM(amount_paid) as total FROM payments WHERE fee_id = ?');
    $total_paid_stmt->execute([$row['id']]);
    $result = $total_paid_stmt->fetch();
    $total_paid = (float)($result['total'] ?? 0);
    $remaining = $row['amount'] - $total_paid;
    echo "Fee ID: {$row['id']}, Student: {$row['student_id']}, Amount: {$row['amount']}, Paid: {$total_paid}, Remaining: {$remaining}\n";
}
?>