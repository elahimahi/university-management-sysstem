<?php
/**
 * Verify payment status
 * POST /payment/verify
 *
 * Request body:
 * {
 *   "transaction_id": "TXN_1234567890_1234"
 * }
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/PaymentGatewayFactory.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$transactionId = $data['transaction_id'] ?? null;

if (!$transactionId) {
    http_response_code(400);
    echo json_encode(['error' => 'Transaction ID required']);
    exit;
}

try {
    // Check if transaction exists in our database
    $stmt = $pdo->prepare('SELECT * FROM payment_transactions WHERE transaction_id = ?');
    $stmt->execute([$transactionId]);
    $transaction = $stmt->fetch();

    if (!$transaction) {
        http_response_code(404);
        echo json_encode(['error' => 'Transaction not found']);
        exit;
    }

    // If already completed, return success
    if ($transaction['status'] === 'completed') {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'transaction_id' => $transactionId,
            'status' => 'completed',
            'message' => 'Payment already verified'
        ]);
        exit;
    }

    // Verify with gateway
    $gatewayFactory = new PaymentGatewayFactory($pdo);
    $gateway = $gatewayFactory->createGateway($transaction['payment_method']);
    $result = $gateway->verifyPayment($transactionId);

    if (!empty($result['success']) && isset($result['status']) && $result['status'] === 'completed') {
        processSuccessfulPayment($pdo, $transactionId);
    }

    http_response_code(200);
    echo json_encode($result);

} catch (Exception $e) {
    error_log('Payment verification error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Verification failed', 'details' => $e->getMessage()]);
}

function processSuccessfulPayment($pdo, $transactionId) {
    $stmt = $pdo->prepare('SELECT * FROM payment_transactions WHERE transaction_id = ?');
    $stmt->execute([$transactionId]);
    $transaction = $stmt->fetch();

    if (!$transaction || $transaction['status'] !== 'completed') {
        return;
    }

    $checkStmt = $pdo->prepare('SELECT id FROM payments WHERE transaction_id = ?');
    $checkStmt->execute([$transactionId]);
    if ($checkStmt->fetch()) {
        return;
    }

    $paymentStmt = $pdo->prepare('
        INSERT INTO payments (fee_id, amount_paid, payment_date, payment_method, transaction_id)
        VALUES (?, ?, GETDATE(), ?, ?)
    ');
    $paymentStmt->execute([
        $transaction['fee_id'],
        $transaction['amount'],
        $transaction['payment_method'],
        $transactionId
    ]);

    $totalPaidStmt = $pdo->prepare('SELECT SUM(amount_paid) as total FROM payments WHERE fee_id = ?');
    $totalPaidStmt->execute([$transaction['fee_id']]);
    $totalPaid = (float)$totalPaidStmt->fetch()['total'];

    $feeStmt = $pdo->prepare('SELECT amount FROM fees WHERE id = ?');
    $feeStmt->execute([$transaction['fee_id']]);
    $fee = $feeStmt->fetch();

    if ($totalPaid >= (float)$fee['amount']) {
        $updateStmt = $pdo->prepare('UPDATE fees SET status = ? WHERE id = ?');
        $updateStmt->execute(['paid', $transaction['fee_id']]);
    }

    $sms_service = new SMSService($pdo);
    $student_phone = $sms_service->getStudentPhone($transaction['student_id']);
    $student_name = $sms_service->getStudentName($transaction['student_id']);

    if ($student_phone) {
        $remaining = max(0, (float)$fee['amount'] - $totalPaid);
        $sms_service->sendPaymentConfirmation(
            $student_phone,
            $student_name,
            $transaction['amount'],
            $transaction['payment_method'],
            $remaining,
            $transaction['student_id']
        );
    }

    $feeDetailStmt = $pdo->prepare('SELECT description FROM fees WHERE id = ?');
    $feeDetailStmt->execute([$transaction['fee_id']]);
    $feeDetail = $feeDetailStmt->fetch();

    $notifyStmt = $pdo->prepare('
        INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $notifyStmt->execute([
        $transaction['student_id'],
        $transaction['fee_id'],
        $transaction['amount'],
        $transaction['payment_method'],
        $feeDetail['description'] ?? 'Fee Payment',
        'unread'
    ]);
}
?>