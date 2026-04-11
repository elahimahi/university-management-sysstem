<?php
/**
 * OneBank Payment Gateway Integration
 * Handles payment processing through OneBank Mobile Banking service
 * 
 * Supports:
 * - OneBank Wallet
 * - Bank Account Transfer
 * - Card Payments
 */

require_once __DIR__ . '/PaymentGateway.php';

class OneBankGateway extends PaymentGateway {
    const SANDBOX_API = 'https://sandbox.onebank.com.bd/api';
    const PRODUCTION_API = 'https://api.onebank.com.bd/api';

    protected function loadConfig() {
        parent::loadConfig();
        require_once __DIR__ . '/payment_config.php';
    }

    /**
     * Initiate payment through OneBank
     */
    public function initiatePayment($paymentData) {
        try {
            $transactionId = $this->generateTransactionId();
            
            // Save transaction record first
            $this->saveTransaction([
                'transaction_id' => $transactionId,
                'student_id' => $paymentData['student_id'],
                'fee_id' => $paymentData['fee_id'],
                'amount' => $paymentData['amount'],
                'payment_method' => 'onebank',
                'phone' => $paymentData['phone'],
                'status' => 'pending'
            ]);

            // Prepare OneBank API request
            $apiUrl = ONEBANK_SANDBOX ? self::SANDBOX_API : self::PRODUCTION_API;
            $apiUrl .= '/v1/payment/initiate';

            $payload = [
                'merchant_id' => ONEBANK_MERCHANT_ID,
                'transaction_id' => $transactionId,
                'amount' => (int)$paymentData['amount'],
                'currency' => 'BDT',
                'customer_mobile' => $paymentData['phone'],
                'customer_email' => $paymentData['email'] ?? '',
                'description' => 'University Fee Payment',
                'return_url' => defined('PAYMENT_SUCCESS_URL') ? PAYMENT_SUCCESS_URL : 'http://localhost:3000/payment/success',
                'cancel_url' => defined('PAYMENT_CANCEL_URL') ? PAYMENT_CANCEL_URL : 'http://localhost:3000/payment/cancel',
                'webhook_url' => defined('PAYMENT_WEBHOOK_URL') ? PAYMENT_WEBHOOK_URL : 'http://localhost:5000/payment/webhook'
            ];

            // Sign request
            $payload['signature'] = $this->generateSignature($payload);

            $this->logPayment('Initiating OneBank payment', [
                'transaction_id' => $transactionId,
                'amount' => $paymentData['amount'],
                'phone' => $paymentData['phone']
            ]);

            // Make API call
            $response = $this->makeRequest($apiUrl, 'POST', $payload);

            if ($response['http_code'] === 200 && $response['response']['status'] === 'success') {
                $this->updateTransactionStatus($transactionId, 'initiated');
                
                return [
                    'success' => true,
                    'transaction_id' => $transactionId,
                    'payment_url' => $response['response']['payment_url'] ?? null,
                    'message' => 'Payment initiated successfully'
                ];
            } else {
                $error = $response['response']['message'] ?? 'Payment initiation failed';
                $this->updateTransactionStatus($transactionId, 'failed');
                
                return [
                    'success' => false,
                    'error' => $error,
                    'transaction_id' => $transactionId
                ];
            }

        } catch (Exception $e) {
            $this->logPayment('OneBank payment initiation error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify payment status
     */
    public function verifyPayment($transactionId) {
        try {
            $apiUrl = ONEBANK_SANDBOX ? self::SANDBOX_API : self::PRODUCTION_API;
            $apiUrl .= '/v1/payment/verify';

            $payload = [
                'merchant_id' => ONEBANK_MERCHANT_ID,
                'transaction_id' => $transactionId
            ];

            $payload['signature'] = $this->generateSignature($payload);

            $response = $this->makeRequest($apiUrl, 'POST', $payload);

            if ($response['http_code'] === 200) {
                $paymentStatus = $response['response']['payment_status'] ?? null;
                
                if ($paymentStatus === 'completed') {
                    return [
                        'success' => true,
                        'status' => 'completed',
                        'transaction_id' => $transactionId
                    ];
                } else if ($paymentStatus === 'pending') {
                    return [
                        'success' => false,
                        'status' => 'pending',
                        'transaction_id' => $transactionId
                    ];
                } else {
                    return [
                        'success' => false,
                        'status' => 'failed',
                        'transaction_id' => $transactionId
                    ];
                }
            }

            return [
                'success' => false,
                'status' => 'unknown',
                'transaction_id' => $transactionId
            ];

        } catch (Exception $e) {
            $this->logPayment('OneBank payment verification error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Handle webhook callback from OneBank
     */
    public function handleWebhook($webhookData) {
        try {
            // Verify webhook signature
            $signature = $webhookData['signature'] ?? null;
            unset($webhookData['signature']);
            
            if (!$this->verifySignature($webhookData, $signature)) {
                return [
                    'success' => false,
                    'error' => 'Invalid webhook signature'
                ];
            }

            $transactionId = $webhookData['transaction_id'] ?? null;
            $paymentStatus = $webhookData['payment_status'] ?? null;

            if (!$transactionId) {
                return [
                    'success' => false,
                    'error' => 'Missing transaction ID'
                ];
            }

            if ($paymentStatus === 'completed') {
                $this->updateTransactionStatus($transactionId, 'completed');
                
                return [
                    'success' => true,
                    'transaction_id' => $transactionId,
                    'status' => 'completed'
                ];
            } else if ($paymentStatus === 'failed') {
                $this->updateTransactionStatus($transactionId, 'failed');
                
                return [
                    'success' => false,
                    'transaction_id' => $transactionId,
                    'status' => 'failed',
                    'error' => $webhookData['error_message'] ?? 'Payment failed'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Unknown payment status'
                ];
            }

        } catch (Exception $e) {
            $this->logPayment('OneBank webhook handling error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate cryptographic signature for API requests
     */
    private function generateSignature($data) {
        ksort($data);
        $signatureString = '';
        
        foreach ($data as $key => $value) {
            if ($key !== 'signature') {
                $signatureString .= $key . '=' . $value . '&';
            }
        }
        
        $signatureString = rtrim($signatureString, '&');
        $signatureString = ONEBANK_API_KEY . $signatureString . ONEBANK_API_KEY;
        
        return hash('sha256', $signatureString);
    }

    /**
     * Verify webhook signature
     */
    private function verifySignature($data, $receivedSignature) {
        $calculatedSignature = $this->generateSignature($data);
        return hash_equals($calculatedSignature, $receivedSignature);
    }

    /**
     * Save transaction to database
     */
    private function saveTransaction($transactionData) {
        try {
            // Create payment_transactions table if not exists
            $this->pdo->exec("
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payment_transactions')
                CREATE TABLE payment_transactions (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    transaction_id VARCHAR(100) UNIQUE NOT NULL,
                    student_id INT NOT NULL,
                    fee_id INT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_method VARCHAR(50) NOT NULL,
                    phone VARCHAR(20),
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (student_id) REFERENCES users(id),
                    FOREIGN KEY (fee_id) REFERENCES fees(id)
                )
            ");

            $stmt = $this->pdo->prepare("
                INSERT INTO payment_transactions (transaction_id, student_id, fee_id, amount, payment_method, phone, status, contact_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $transactionData['transaction_id'],
                $transactionData['student_id'],
                $transactionData['fee_id'],
                $transactionData['amount'],
                $transactionData['payment_method'],
                $transactionData['phone'],
                $transactionData['status'],
                $transactionData['phone']
            ]);

        } catch (Exception $e) {
            $this->logPayment('Transaction save error', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update transaction status
     */
    private function updateTransactionStatus($transactionId, $status) {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE payment_transactions 
                SET status = ?, updated_at = GETDATE()
                WHERE transaction_id = ?
            ");
            $stmt->execute([$status, $transactionId]);

        } catch (Exception $e) {
            $this->logPayment('Transaction status update error', ['error' => $e->getMessage()]);
        }
    }
}
?>
