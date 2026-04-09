<?php
/**
 * Base Payment Gateway Class
 * Provides common functionality for all payment gateways
 */

abstract class PaymentGateway {
    protected $config;
    protected $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->loadConfig();
    }

    protected function loadConfig() {
        require_once __DIR__ . '/payment_config.php';
    }

    /**
     * Initialize a payment transaction
     * @param array $paymentData Contains amount, student_id, fee_id, etc.
     * @return array Response with payment URL or transaction details
     */
    abstract public function initiatePayment($paymentData);

    /**
     * Verify payment status
     * @param string $transactionId
     * @return array Payment verification result
     */
    abstract public function verifyPayment($transactionId);

    /**
     * Handle webhook/callback from payment gateway
     * @param array $webhookData
     * @return array Processing result
     */
    abstract public function handleWebhook($webhookData);

    /**
     * Make HTTP request to payment gateway API
     */
    protected function makeRequest($url, $method = 'POST', $data = null, $headers = [], $useJson = true) {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For development only

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                if ($useJson) {
                    $payload = json_encode($data);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                    $headers[] = 'Content-Type: application/json';
                } else {
                    $payload = http_build_query($data);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                    $headers[] = 'Content-Type: application/x-www-form-urlencoded';
                }
            }
        }

        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            throw new Exception('CURL Error: ' . curl_error($ch));
        }

        curl_close($ch);

        return [
            'response' => json_decode($response, true),
            'http_code' => $httpCode,
            'raw_response' => $response
        ];
    }

    /**
     * Generate unique transaction ID
     */
    protected function generateTransactionId() {
        return 'TXN_' . time() . '_' . rand(1000, 9999);
    }

    /**
     * Log payment activity
     */
    protected function logPayment($message, $data = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'message' => $message,
            'data' => $data
        ];

        $logFile = __DIR__ . '/../payment/payment_gateway.log';
        file_put_contents($logFile, json_encode($logData) . PHP_EOL, FILE_APPEND);
    }
}
?>