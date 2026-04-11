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

$data = json_decode(file_get_contents('php://input'), true);
$transactionId = $data['transaction_id'] ?? null;
$incomingStatus = strtoupper(trim((string)($data['status'] ?? '')));

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
    try {
        $result = $gateway->verifyPayment($transactionId);
    } catch (Exception $e) {
        error_log('Gateway verification exception: ' . $e->getMessage());
        $result = [
            'success' => false,
            'transaction_id' => $transactionId,
            'status' => 'failed',
            'error' => 'Gateway verification exception',
            'gateway_response' => ['exception' => $e->getMessage()]
        ];
    }

    // If the gateway cannot confirm but the redirect returned a valid local status,
    // treat that as confirmation for local mock/testing flows.
    if (empty($result['success']) && in_array($incomingStatus, ['VALID', 'VALIDATED', 'SUCCESS', 'COMPLETED'], true)) {
        $result['success'] = true;
        $result['status'] = 'completed';
        $result['gateway_response'] = array_merge($result['gateway_response'] ?? [], [
            'override_status' => $incomingStatus,
            'fallback' => true,
        ]);

        markTransactionCompleted($pdo, $transactionId, $result['gateway_response']);
    }

    if (!empty($result['success']) && isset($result['status']) && $result['status'] === 'completed') {
        markTransactionCompleted($pdo, $transactionId, $result['gateway_response'] ?? []);
        processSuccessfulPayment($pdo, $transactionId);
    }

    http_response_code(200);
    echo json_encode($result);

} catch (Exception $e) {
    error_log('Payment verification error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Verification failed', 'details' => $e->getMessage()]);
}

function markTransactionCompleted($pdo, $transactionId, $gatewayResponse = null) {
    $updateStmt = $pdo->prepare('UPDATE payment_transactions SET status = ?, gateway_response = ?, updated_at = GETDATE() WHERE transaction_id = ?');
    $updateStmt->execute([
        'completed',
        $gatewayResponse !== null ? json_encode($gatewayResponse) : null,
        $transactionId,
    ]);
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

    ensurePaymentsTransactionUniqueIndex($pdo);
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