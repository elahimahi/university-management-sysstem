<?php
/**
 * Payment Gateway Factory
 * Creates appropriate gateway instance based on payment method
 */

require_once __DIR__ . '/SSLCommerzGateway.php';
// Add other gateways here as needed

class PaymentGatewayFactory {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function createGateway($paymentMethod) {
        $method = strtolower($paymentMethod);

        switch ($method) {
            case 'bkash':
            case 'nagad':
            case 'rocket':
            case 'card':
                return new SSLCommerzGateway($this->pdo);
            default:
                throw new Exception("Unsupported payment method: {$paymentMethod}");
        }
    }
}
?>