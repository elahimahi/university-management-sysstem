<?php
/**
 * =====================================================
 * PAYMENT GATEWAY CONFIGURATION
 * =====================================================
 * 
 * This file contains all payment processor credentials
 * and settings for the university payment system.
 * 
 * Current Mode: REAL PAYMENT GATEWAYS
 * 
 * ⚠️  DO NOT COMMIT CREDENTIALS TO VERSION CONTROL
 * ⚠️  KEEP THIS FILE SECURE - CONTAINS SENSITIVE DATA
 * 
 * Support: See PAYMENT_SYSTEM_SETUP.md for complete guide
 */

// =====================================================
// SSLCommerz Configuration (PRIMARY GATEWAY)
// =====================================================
// 
// SSLCommerz handles: Card, bKash, Nagad, Rocket
// Website: https://www.sslcommerz.com
// Dashboard: https://merchant.sslcommerz.com
//
// Get credentials from: Dashboard → Settings → Store Credentials
//

define('SSLCOMMERZ_STORE_ID', 'testhdf');
// ↑ STEP 1: Replace 'testhdf' with your actual Store ID from SSLCommerz Dashboard
// Example: 'myuniversity123'

define('SSLCOMMERZ_STORE_PASSWORD', 'testhdf@123');
// ↑ STEP 2: Replace 'testhdf@123' with your StorePassword from SSLCommerz Dashboard

define('SSLCOMMERZ_SANDBOX', true);
// ← Testing Mode Enabled (false = Real transactions, true = Testing only)
// Use SANDBOX = true with test credentials (testhdf/testhdf@123)

define('PAYMENT_USE_MOCK_GATEWAY', true);
// ← Real Gateway Enabled (false = Real SSLCommerz, true = Mock testing)
// DO NOT SET TO TRUE IN PRODUCTION

define('SSLCOMMERZ_API_URL', SSLCOMMERZ_SANDBOX ?
    'https://sandbox.sslcommerz.com' :
    'https://securepay.sslcommerz.com');
// Automatically switches between sandbox and production URLs


// =====================================================
// bKash Configuration (OPTIONAL - Integrated via SSLCommerz)
// =====================================================
// Note: bKash is handled through SSLCommerz gateway above
// Only fill these if implementing direct bKash integration

define('BKASH_APP_KEY', 'your_app_key_here');
define('BKASH_APP_SECRET', 'your_app_secret_here');
define('BKASH_USERNAME', 'your_username_here');
define('BKASH_PASSWORD', 'your_password_here');
define('BKASH_SANDBOX', true);
define('BKASH_BASE_URL', BKASH_SANDBOX ?
    'https://checkout.sandbox.bka.sh/v1.2.0-beta' :
    'https://checkout.bka.sh/v1.2.0-beta');


// =====================================================
// Nagad Configuration (OPTIONAL - Integrated via SSLCommerz)
// =====================================================

define('NAGAD_MERCHANT_ID', 'your_merchant_id_here');
define('NAGAD_MERCHANT_PRIVATE_KEY', 'your_private_key_here');
define('NAGAD_SANDBOX', true);
define('NAGAD_BASE_URL', NAGAD_SANDBOX ?
    'https://api-sandbox.nagad.com' :
    'https://api.nagad.com');


// =====================================================
// Rocket Configuration (OPTIONAL - Integrated via SSLCommerz)
// =====================================================

define('ROCKET_MERCHANT_ID', 'your_merchant_id_here');
define('ROCKET_API_KEY', 'your_api_key_here');
define('ROCKET_SANDBOX', true);
define('ROCKET_BASE_URL', ROCKET_SANDBOX ?
    'https://api-sandbox.rocket.com' :
    'https://api.rocket.com');


// =====================================================
// Payment URLs & Settings
// =====================================================
// These URLs are where customers return after payment

define('PAYMENT_CURRENCY', 'BDT');

define('PAYMENT_SUCCESS_URL', 'http://localhost:5000/payment/success');
// ↑ STEP 3: Change 'localhost:5000' to your actual domain and port
// Example: 'https://university.edu.bd/payment/success'

define('PAYMENT_FAIL_URL', 'http://localhost:5000/payment/fail');
// ↑ Also update to your domain

define('PAYMENT_CANCEL_URL', 'http://localhost:5000/payment/cancel');
// ↑ Also update to your domain

define('PAYMENT_WEBHOOK_URL', 'http://localhost:5000/payment/webhook');
// ↑ For payment confirmation callbacks (also update to your domain)


// =====================================================
// CHECKLIST BEFORE GOING LIVE
// =====================================================
// 
// ✓ [ ] Get SSLCommerz account from sslcommerz.com
// ✓ [ ] Update SSLCOMMERZ_STORE_ID above
// ✓ [ ] Update SSLCOMMERZ_STORE_PASSWORD above
// ✓ [ ] Update PAYMENT_SUCCESS_URL, FAIL_URL, CANCEL_URL
// ✓ [ ] Verify these URLs in SSLCommerz Dashboard Settings
// ✓ [ ] Test a payment transaction end-to-end
// ✓ [ ] Check payment appears in database
// ✓ [ ] Verify student receives notification
// ✓ [ ] Run verify_payment_setup.php to confirm all settings
// 
// After completing all checks, you're ready for production!
// =====================================================

?>