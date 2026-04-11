<?php
require_once __DIR__ . '/core/db_connect.php';

header('Content-Type: application/json');

$stmt = $pdo->prepare('
    SELECT TOP 10
        f.id,
        f.student_id,
        f.description,
        f.amount,
        f.status,
        ISNULL(SUM(p.amount_paid), 0) as paid_amount
    FROM fees f
    LEFT JOIN payments p ON f.id = p.fee_id
    GROUP BY f.id, f.student_id, f.description, f.amount, f.status
');

$stmt->execute();
$fees = $stmt->fetchAll();

echo json_encode($fees, JSON_PRETTY_PRINT);
?>
