<?php
/**
 * SMS Configuration
 * Configure SMS provider credentials here
 */

// SMS Provider: Choose one of: 'twilio', 'nexmo', 'bdesl', 'test'
define('SMS_PROVIDER', 'test');

// Twilio Configuration
define('TWILIO_ACCOUNT_SID', 'your-twilio-account-sid');
define('TWILIO_AUTH_TOKEN', 'your-twilio-auth-token');
define('TWILIO_PHONE_NUMBER', '+1234567890');

// Nexmo/Vonage Configuration
define('NEXMO_API_KEY', 'your-nexmo-api-key');
define('NEXMO_API_SECRET', 'your-nexmo-api-secret');
define('NEXMO_PHONE_NUMBER', 'YourBrand');

// Bangladesh ESL SMS Configuration (Local Provider)
define('BDESL_API_URL', 'https://api.bdesl.com/api/send');
define('BDESL_API_KEY', 'your-bdesl-api-key');
define('BDESL_SENDER_ID', 'EncryptUni');

// Test Mode (Logs SMS without sending)
define('SMS_LOG_FILE', __DIR__ . '/../sms_log.txt');
define('SMS_ENABLE_LOGGING', true);

// SMS Rate Limiting
define('SMS_MAX_PER_STUDENT_PER_DAY', 5);
define('SMS_COOLDOWN_MINUTES', 5);

?>
