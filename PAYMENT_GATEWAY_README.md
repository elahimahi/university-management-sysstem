# Payment Gateway Integration

This system now supports real payment gateways for bKash, Nagad, Rocket, and card payments using SSLCommerz.

## Setup Instructions

### 1. Configure API Credentials

Edit `backend/core/payment_config.php` and add your actual API credentials:

```php
// SSLCommerz Configuration
define('SSLCOMMERZ_STORE_ID', 'your_actual_store_id_here');
define('SSLCOMMERZ_STORE_PASSWORD', 'your_actual_store_password_here');
define('SSLCOMMERZ_SANDBOX', true); // Set to false for production

// bKash Configuration (if using direct bKash integration)
define('BKASH_APP_KEY', 'your_app_key_here');
define('BKASH_APP_SECRET', 'your_app_secret_here');
// ... other credentials
```

### 2. Get SSLCommerz Account

1. Sign up at [SSLCommerz](https://www.sslcommerz.com/)
2. Get your Store ID and Password
3. Configure sandbox credentials first for testing

### 3. Database Migration

The database has been automatically updated with:
- `transaction_id` column in `payments` table
- `payment_transactions` table for gateway tracking

### 4. Webhook Configuration

Configure webhooks in your SSLCommerz dashboard:
- Success URL: `http://localhost:5000/payment/webhook`
- Fail URL: `http://localhost:3000/payment/fail`
- Cancel URL: `http://localhost:3000/payment/cancel`

## How It Works

1. **Payment Initiation**: Student selects payment method and amount
2. **Gateway Redirect**: System redirects to SSLCommerz payment page
3. **Payment Processing**: Student completes payment on gateway
4. **Webhook/Callback**: Gateway sends confirmation to webhook endpoint
5. **Verification**: System verifies payment and updates records
6. **Completion**: Student sees success/failure page

## Supported Payment Methods

- **bKash**: Mobile wallet payment
- **Nagad**: Mobile wallet payment
- **Rocket**: Mobile wallet payment
- **Card**: Credit/Debit card payment

## Testing

Use SSLCommerz sandbox environment for testing:
- Test cards and mobile numbers are provided in SSLCommerz documentation
- All transactions are simulated

## Production Deployment

1. Set `SSLCOMMERZ_SANDBOX` to `false`
2. Update webhook URLs to production domain
3. Use production API credentials
4. Test thoroughly before going live

## Security Notes

- Never commit API credentials to version control
- Use HTTPS in production
- Validate all webhook requests
- Log payment activities for auditing