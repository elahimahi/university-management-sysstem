<?php
/**
 * SSLCommerz Payment Gateway Implementation
 * Supports card payments and mobile wallets (bKash, Nagad, Rocket)
 */

require_once __DIR__ . '/PaymentGateway.php';

class SSLCommerzGateway extends PaymentGateway {

    public function initiatePayment($paymentData) {
        $amount = $paymentData['amount'];
        $studentId = $paymentData['student_id'];
        $feeId = $paymentData['fee_id'];
        $paymentMethod = $paymentData['payment_method'] ?? 'card';

        // Get student details
        $studentStmt = $this->pdo->prepare('SELECT CONCAT(first_name, \' \', last_name) as name, email FROM users WHERE id = ?');
        $studentStmt->execute([$studentId]);
        $student = $studentStmt->fetch();

        if (!$student) {
            throw new Exception('Student not found');
        }

        // Get fee details
        $feeStmt = $this->pdo->prepare('SELECT description FROM fees WHERE id = ?');
        $feeStmt->execute([$feeId]);
        $fee = $feeStmt->fetch();

        $transactionId = $this->generateTransactionId();

        // Store transaction in database
        $insertStmt = $this->pdo->prepare('
            INSERT INTO payment_transactions (transaction_id, student_id, fee_id, amount, payment_method, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        ');
        $insertStmt->execute([$transactionId, $studentId, $feeId, $amount, $paymentMethod, 'pending']);

        // Prepare SSLCommerz payment data
        $phone = $paymentData['phone'] ?? null;
        if ($phone) {
            $phone = preg_replace('/\D/', '', $phone);
        }

        $postData = [
            'store_id' => SSLCOMMERZ_STORE_ID,
            'store_passwd' => SSLCOMMERZ_STORE_PASSWORD,
            'total_amount' => $amount,
            'currency' => PAYMENT_CURRENCY,
            'tran_id' => $transactionId,
            'success_url' => PAYMENT_SUCCESS_URL,
            'fail_url' => PAYMENT_FAIL_URL,
            'cancel_url' => PAYMENT_CANCEL_URL,
            'cus_name' => $student['name'],
            'cus_email' => $student['email'] ?? 'student@example.com',
            'cus_phone' => $phone ?: '01700000000',
            'cus_add1' => 'Dhaka, Bangladesh',
            'cus_city' => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'product_name' => $fee['description'] ?? 'Fee Payment',
            'product_category' => 'Education',
            'product_profile' => 'general',
            'shipping_method' => 'NO',
            'num_of_item' => 1
        ];

        // Add payment method specific parameters
        if ($paymentMethod === 'bkash') {
            $postData['payment_option'] = 'bkash';
        } elseif ($paymentMethod === 'nagad') {
            $postData['payment_option'] = 'nagad';
        } elseif ($paymentMethod === 'rocket') {
            $postData['payment_option'] = 'rocket';
        }

        $url = SSLCOMMERZ_API_URL . '/gwprocess/v4/api.php';

        // For development testing with placeholder credentials
        if (SSLCOMMERZ_STORE_ID === 'your_store_id_here') {
            $this->logPayment('Using mock payment URL for development', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'method' => $paymentMethod
            ]);
            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'payment_url' => 'http://localhost/Database_Project/university-management-sysstem/mock_payment.html?tran_id=' . $transactionId . '&amount=' . $amount . '&method=' . $paymentMethod,
                'status' => 'pending'
            ];
        }

        $this->logPayment('Initiating SSLCommerz payment', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'method' => $paymentMethod
        ]);

        $response = $this->makeRequest($url, 'POST', $postData, [], false);

        if ($response['http_code'] === 200 && isset($response['response']['GatewayPageURL'])) {
            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'payment_url' => $response['response']['GatewayPageURL'],
                'status' => 'pending'
            ];
        } else {
            $this->logPayment('SSLCommerz payment initiation failed', $response);
            $errorMessage = 'Unknown error';
            if (isset($response['response']['failedreason'])) {
                $errorMessage = $response['response']['failedreason'];
            } elseif (isset($response['response']['message'])) {
                $errorMessage = $response['response']['message'];
            }
            return [
                'success' => false,
                'error' => 'Failed to initiate payment: ' . $errorMessage
            ];
        }
    }

    public function verifyPayment($transactionId) {
        // For development testing with mock transactions
        if (SSLCOMMERZ_STORE_ID === 'your_store_id_here' && strpos($transactionId, 'TXN_') === 0) {
            // Mark mock transaction as completed
            $updateStmt = $this->pdo->prepare('
                UPDATE payment_transactions
                SET status = \'completed\', gateway_response = ?, updated_at = GETDATE()
                WHERE transaction_id = ?
            ');
            $updateStmt->execute([json_encode(['status' => 'VALID', 'mock' => true]), $transactionId]);

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'status' => 'completed',
                'gateway_response' => ['status' => 'VALID', 'mock' => true]
            ];
        }

        // Query SSLCommerz for payment status
        $validationData = [
            'store_id' => SSLCOMMERZ_STORE_ID,
            'store_passwd' => SSLCOMMERZ_STORE_PASSWORD,
            'tran_id' => $transactionId
        ];

        $url = SSLCOMMERZ_API_URL . '/validator/api/validationserverAPI.php';

        $response = $this->makeRequest($url, 'POST', $validationData);

        if ($response['http_code'] === 200) {
            $result = $response['response'];

            $status = 'failed';
            if (isset($result['status']) && $result['status'] === 'VALID') {
                $status = 'completed';
            } elseif (isset($result['status']) && $result['status'] === 'VALIDATED') {
                $status = 'completed';
            }

            // Update transaction status in database
            $updateStmt = $this->pdo->prepare('
                UPDATE payment_transactions
                SET status = ?, gateway_response = ?, updated_at = GETDATE()
                WHERE transaction_id = ?
            ');
            $updateStmt->execute([$status, json_encode($result), $transactionId]);

            return [
                'success' => $status === 'completed',
                'transaction_id' => $transactionId,
                'status' => $status,
                'gateway_response' => $result
            ];
        }

        return [
            'success' => false,
            'transaction_id' => $transactionId,
            'status' => 'failed',
            'error' => 'Verification failed'
        ];
    }

    public function handleWebhook($webhookData) {
        // SSLCommerz sends POST data to webhook URL
        $transactionId = $webhookData['tran_id'] ?? null;
        $status = $webhookData['status'] ?? null;

        if (!$transactionId) {
            return ['success' => false, 'error' => 'Missing transaction ID'];
        }

        // Verify the payment
        $verification = $this->verifyPayment($transactionId);

        if ($verification['success']) {
            // Process the successful payment
            $this->processSuccessfulPayment($transactionId);
        }

        return $verification;
    }

    private function processSuccessfulPayment($transactionId) {
        // Get transaction details
        $stmt = $this->pdo->prepare('SELECT * FROM payment_transactions WHERE transaction_id = ?');
        $stmt->execute([$transactionId]);
        $transaction = $stmt->fetch();

        if (!$transaction) {
            return;
        }

        // Record the payment
        $paymentStmt = $this->pdo->prepare('
            INSERT INTO payments (fee_id, amount_paid, payment_date, payment_method, transaction_id)
            VALUES (?, ?, GETDATE(), ?, ?)
        ');
        $paymentStmt->execute([
            $transaction['fee_id'],
            $transaction['amount'],
            $transaction['payment_method'],
            $transactionId
        ]);

        // Update fee status if needed (similar to existing process.php logic)
        // ... (you can copy the logic from process.php)
    }
}
?>