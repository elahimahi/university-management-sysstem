<?php
/**
 * Payment Gateway Webhook Handler
 * Handles callbacks from payment gateways
 * POST /payment/webhook
 */

// ============================================
// CORS HEADERS - MUST BE FIRST
// ============================================
ob_start();

// Allow requests from localhost (all ports)
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Set appropriate origin header
if (in_array($origin, $allowed_origins) && !empty($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} elseif (empty($origin)) {
    header('Access-Control-Allow-Origin: http://localhost', true);
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

http_response_code(200);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/PaymentGatewayFactory.php';
require_once __DIR__ . '/../core/sms_service.php';

function ensureAdminNotificationsTransactionColumn($pdo) {
    try {
        $pdo->exec("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'transaction_id') ALTER TABLE admin_notifications ADD transaction_id VARCHAR(100) NULL");
    } catch (Exception $e) {
        error_log('Failed to ensure admin_notifications.transaction_id column: ' . $e->getMessage());
    }
}

function ensureAdminNotificationsTransactionIndex($pdo) {
    try {
        $pdo->exec("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'UQ_AdminNotifications_TransactionId') CREATE UNIQUE INDEX UQ_AdminNotifications_TransactionId ON admin_notifications(transaction_id) WHERE transaction_id IS NOT NULL");
    } catch (Exception $e) {
        error_log('Failed to ensure admin_notifications.transaction_id unique index: ' . $e->getMessage());
    }
}

function ensurePaymentsTransactionUniqueIndex($pdo) {
    try {
        $pdo->exec("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('payments') AND name = 'UQ_Payments_TransactionId') CREATE UNIQUE INDEX UQ_Payments_TransactionId ON payments(transaction_id) WHERE transaction_id IS NOT NULL");
    } catch (Exception $e) {
        error_log('Failed to ensure payments.transaction_id unique index: ' . $e->getMessage());
    }
}

function adminNotificationExists($pdo, $transactionId, $student_id, $fee_id, $amount, $payment_method) {
    $columnExistsStmt = $pdo->query("SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'transaction_id'");
    $columnExists = $columnExistsStmt->fetch();

    if ($columnExists) {
        $checkNotifyStmt = $pdo->prepare('SELECT id FROM admin_notifications WHERE transaction_id = ?');
        $checkNotifyStmt->execute([$transactionId]);
    } else {
        $checkNotifyStmt = $pdo->prepare('SELECT id FROM admin_notifications WHERE student_id = ? AND fee_id = ? AND amount = ? AND payment_method = ?');
        $checkNotifyStmt->execute([$student_id, $fee_id, $amount, $payment_method]);
    }

    return (bool) $checkNotifyStmt->fetch();
}

function insertAdminNotification($pdo, $student_id, $fee_id, $amount, $payment_method, $fee_description, $transaction_id = null) {
    ensureAdminNotificationsTransactionColumn($pdo);

    $columnExistsStmt = $pdo->query("SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('admin_notifications') AND name = 'transaction_id'");
    $columnExists = $columnExistsStmt->fetch();

    if ($columnExists) {
        ensureAdminNotificationsTransactionIndex($pdo);
        $notifyStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        try {
            $notifyStmt->execute([$student_id, $fee_id, $amount, $payment_method, $fee_description, 'unread', $transaction_id]);
        } catch (PDOException $e) {
            $sqlError = $e->errorInfo[1] ?? null;
            if (in_array($sqlError, [2601, 2627], true)) {
                return;
            }
            throw $e;
        }
    } else {
        $notifyStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status) VALUES (?, ?, ?, ?, ?, ?)');
        $notifyStmt->execute([$student_id, $fee_id, $amount, $payment_method, $fee_description, 'unread']);
    }
}

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

    ensurePaymentsTransactionUniqueIndex($pdo);

    // Check if payment already recorded
    $checkStmt = $pdo->prepare('SELECT id FROM payments WHERE transaction_id = ?');
    $checkStmt->execute([$transactionId]);
    if ($checkStmt->fetch()) {
        return; // Already processed
    }

    // Record the payment
    $paymentStmt = $pdo->prepare('
        INSERT INTO payments (fee_id, amount_paid, payment_date, payment_method, transaction_id, phone_or_account)
        VALUES (?, ?, GETDATE(), ?, ?, ?)
    ');
    try {
        $paymentStmt->execute([
            $transaction['fee_id'],
            $transaction['amount'],
            $transaction['payment_method'],
            $transactionId,
            $transaction['contact_info'] ?? ''
        ]);
    } catch (PDOException $e) {
        $sqlError = $e->errorInfo[1] ?? null;
        if (in_array($sqlError, [2601, 2627], true)) {
            return;
        }
        throw $e;
    }

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

    if (!adminNotificationExists($pdo, $transactionId, $transaction['student_id'], $transaction['fee_id'], $transaction['amount'], $transaction['payment_method'])) {
        insertAdminNotification(
            $pdo,
            $transaction['student_id'],
            $transaction['fee_id'],
            $transaction['amount'],
            $transaction['payment_method'],
            $feeDetail['description'] ?? 'Fee Payment',
            $transactionId
        );
    }
}
?>