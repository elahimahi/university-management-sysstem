<?php
/**
 * Payment Gateway Webhook Handler
 * Handles callbacks from payment gateways
 * POST /payment/webhook
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/PaymentGatewayFactory.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

// Get webhook data based on gateway
$webhookData = $_POST;

// For SSLCommerz, data comes as POST parameters
if (empty($webhookData)) {
    $webhookData = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Determine gateway type from request data
$gatewayType = 'sslcommerz'; // Default to SSLCommerz

if (isset($webhookData['tran_id'])) {
    $gatewayType = 'sslcommerz';
}

try {
    $gatewayFactory = new PaymentGatewayFactory($pdo);
    $gateway = $gatewayFactory->createGateway($gatewayType);

    $result = $gateway->handleWebhook($webhookData);

    if ($result['success']) {
        // Process successful payment
        processSuccessfulPayment($pdo, $result['transaction_id']);
        http_response_code(200);
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'failed', 'error' => $result['error']]);
    }

} catch (Exception $e) {
    error_log('Webhook processing error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Webhook processing failed']);
}

/**
 * Process a successful payment
 */
function processSuccessfulPayment($pdo, $transactionId) {
    // Get transaction details
    $stmt = $pdo->prepare('SELECT * FROM payment_transactions WHERE transaction_id = ?');
    $stmt->execute([$transactionId]);
    $transaction = $stmt->fetch();

    if (!$transaction || $transaction['status'] !== 'completed') {
        return;
    }

    // Check if payment already recorded
    $checkStmt = $pdo->prepare('SELECT id FROM payments WHERE transaction_id = ?');
    $checkStmt->execute([$transactionId]);
    if ($checkStmt->fetch()) {
        return; // Already processed
    }

    // Record the payment
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

    // Update fee status if needed
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

    // Send SMS notification
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

    // Create admin notification
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