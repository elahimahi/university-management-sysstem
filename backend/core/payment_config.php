<?php
/**
 * Payment Gateway Configuration
 * Contains API credentials and settings for payment processors
 */

// SSLCommerz Configuration (for card payments and as backup)
define('SSLCOMMERZ_STORE_ID', 'your_store_id_here');
define('SSLCOMMERZ_STORE_PASSWORD', 'your_store_password_here');
define('SSLCOMMERZ_SANDBOX', true); // Set to false for production
define('SSLCOMMERZ_API_URL', SSLCOMMERZ_SANDBOX ?
    'https://sandbox.sslcommerz.com' :
    'https://securepay.sslcommerz.com');

// bKash Configuration
define('BKASH_APP_KEY', 'your_app_key_here');
define('BKASH_APP_SECRET', 'your_app_secret_here');
define('BKASH_USERNAME', 'your_username_here');
define('BKASH_PASSWORD', 'your_password_here');
define('BKASH_SANDBOX', true); // Set to false for production
define('BKASH_BASE_URL', BKASH_SANDBOX ?
    'https://checkout.sandbox.bka.sh/v1.2.0-beta' :
    'https://checkout.bka.sh/v1.2.0-beta');

// Nagad Configuration
define('NAGAD_MERCHANT_ID', 'your_merchant_id_here');
define('NAGAD_MERCHANT_PRIVATE_KEY', 'your_private_key_here');
define('NAGAD_SANDBOX', true); // Set to false for production
define('NAGAD_BASE_URL', NAGAD_SANDBOX ?
    'https://api-sandbox.nagad.com' :
    'https://api.nagad.com');

// Rocket Configuration
define('ROCKET_MERCHANT_ID', 'your_merchant_id_here');
define('ROCKET_API_KEY', 'your_api_key_here');
define('ROCKET_SANDBOX', true); // Set to false for production
define('ROCKET_BASE_URL', ROCKET_SANDBOX ?
    'https://api-sandbox.rocket.com' :
    'https://api.rocket.com');

// General settings
define('PAYMENT_CURRENCY', 'BDT');
define('PAYMENT_SUCCESS_URL', 'http://localhost:3000/payment/success');
define('PAYMENT_FAIL_URL', 'http://localhost:3000/payment/fail');
define('PAYMENT_CANCEL_URL', 'http://localhost:3000/payment/cancel');

// Webhook URLs for payment confirmation
define('PAYMENT_WEBHOOK_URL', 'http://localhost:5000/payment/webhook');
?>