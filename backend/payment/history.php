<?php
/**
 * Get payment history for a student or fee
 * GET /payment/history?student_id=10&fee_id=5
 */

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;
$fee_id = $_GET['fee_id'] ?? null;

if (!$student_id && !$fee_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters: student_id or fee_id']);
    exit;
}

try {
    if ($fee_id && !$student_id) {
        // Get payment history for a specific fee
        $stmt = $pdo->prepare('
            SELECT 
                p.id,
                p.fee_id,
                p.amount_paid,
                p.payment_date,
                p.payment_method,
                p.phone_or_account,
                f.description,
                f.amount as fee_amount
            FROM payments p
            JOIN fees f ON p.fee_id = f.id
            WHERE p.fee_id = ?
            ORDER BY p.payment_date DESC
        ');
        $stmt->execute([$fee_id]);
    } else {
        // Get payment history for a student
        $stmt = $pdo->prepare('
            SELECT 
                p.id,
                p.fee_id,
                p.amount_paid,
                p.payment_date,
                p.payment_method,
                p.phone_or_account,
                f.description,
                f.amount as fee_amount,
                f.status,
                u.email
            FROM payments p
            JOIN fees f ON p.fee_id = f.id
            JOIN users u ON f.student_id = u.id
            WHERE f.student_id = ?
            ORDER BY p.payment_date DESC
        ');
        $stmt->execute([$student_id]);
    }
    
    $payments = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'payments' => $payments
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
