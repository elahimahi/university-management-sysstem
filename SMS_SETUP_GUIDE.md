# SMS Notification System Setup Guide

## 🔔 Features Implemented

### 1. **Payment Confirmation SMS**
- Sent automatically when payment is successful
- Includes: Amount paid, Payment method, Remaining balance, Pending fees count
- Format: "Encrypt University: Payment Confirmed!"

### 2. **Pending Fees Reminder SMS**
- Manually triggered via admin
- Shows: Number of pending fees, Total amount due, Contact info
- Format: "Encrypt University: Fee Reminder"

### 3. **Payment Receipt SMS**
- Contains: Transaction ID, Amount, Date/Time, Verification link

---

## 📱 How It Works

### Payment Confirmation Flow
```
Student Makes Payment
    ↓
POST /payment/process
    ↓
Payment Recorded in Database
    ↓
SMS Service Triggered (SMSService class)
    ↓
SMS Logged to sms_logs table
    ↓
SMS Sent to Student Phone
    ↓
Response Includes SMS Status
```

---

## 🛠️ Integration Steps

### Step 1: Database Setup
Run the SMS setup script to create the sms_logs table:
```bash
# Connect to your database and run:
# Tables automatically created via sms_setup.php
```

### Step 2: Add Phone Number to Users Table
If not already present, add phone field:
```sql
ALTER TABLE users 
ADD phone VARCHAR(20);
```

### Step 3: Configure SMS Provider

Currently, the system is set up with **simulated SMS sending** (for testing).

**For Production, integrate with one of these providers:**

#### Option A: Twilio (Global, Most Popular)
```php
// In backend/core/sms_service.php, replace sendSMS() method:
$twilio = new Client($TWILIO_ACCOUNT_SID, $TWILIO_AUTH_TOKEN);
$message = $twilio->messages->create(
    $phone_number,
    ['from' => $TWILIO_PHONE_NUMBER, 'body' => $message]
);
```

#### Option B: Nexmo/Vonage
```php
$client = new client(new Zend\Http\Client());
$response = $client->message()->sendMessage(new NexmoMessage(
    'Encrypt University',
    $phone_number,
    $message
));
```

#### Option C: Local BD SMS Provider (AmarSMS, Grameenphone, Banglalink)
```php
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.amarsms.com/api/send",
    CURLOPT_POSTFIELDS => http_build_query([
        'api_key' => SMS_API_KEY,
        'type' => 'text',
        'contacts' => $phone_number,
        'sms_body' => $message
    ])
]);
$response = curl_exec($curl);
```

---

## 📡 API Endpoints

### 1. Process Payment (with SMS)
```
POST /payment/process
{
  "fee_id": 5,
  "student_id": 10,
  "amount_paid": 2500,
  "payment_method": "bkash",
  "phone_number": "01712345678"
}

Response:
{
  "success": true,
  "sms_notification": {
    "success": true,
    "message": "SMS sent successfully",
    "phone": "01712345678",
    "type": "payment_confirmation"
  }
}
```

### 2. Send Pending Fees Reminder
```
GET|POST /payment/send-reminder?student_id=10

Response:
{
  "success": true,
  "message": "Pending fees reminder sent",
  "student": "John Doe",
  "phone": "01712345678",
  "pending_count": 2,
  "total_pending": 5000,
  "sms_result": { ... }
}
```

---

## 📊 SMS Logs

All SMS messages are logged in the `sms_logs` table for audit and delivery tracking:

```sql
SELECT * FROM sms_logs 
WHERE sms_type = 'payment_confirmation' 
ORDER BY created_at DESC;
```

Fields:
- `id` - Unique log entry
- `phone_number` - Recipient phone
- `message` - SMS content
- `sms_type` - Type (payment_confirmation, pending_reminder, etc.)
- `sent_at` - Timestamp when sent
- `status` - Current status (sent, failed, pending)
- `delivery_status` - Delivery confirmation status

---

## 🔐 Security Notes

1. **Phone Number Validation**
   - Bangladesh format: 01XXXXXXXXX
   - Stored encrypted in production

2. **API Key Management**
   - Store SMS provider keys in `.env` file
   - Never commit credentials to git

3. **Rate Limiting**
   - Implement to prevent SMS spam
   - Add per-user SMS sending limits

---

## 🧪 Testing

### Test SMS Sending (Without API Key)
```bash
# Check SMS log file
cat backend/sms_log.txt

# Or query database
SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 10;
```

### Simulate Payment
1. Login as student
2. Go to Fees page
3. Click "Pay"
4. Submit payment form
5. Check `sms_logs` table for SMS record

---

## 📝 SMS Message Templates

### Payment Confirmation
```
Encrypt University: Payment Confirmed!
Dear [Name],
Your payment of ৳[Amount] via [METHOD] has been successfully processed.
Remaining due: ৳[REMAINING] | Pending fees: [COUNT]
Contact: support@encryptuniversity.edu
```

### Pending Fees Reminder
```
Encrypt University: Fee Reminder
Dear [Name],
You have [COUNT] pending fee(s) totaling ৳[TOTAL].
Please pay by the due date to avoid penalties.
Contact: support@encryptuniversity.edu
```

### Payment Receipt
```
Encrypt University: Payment Receipt
Txn ID: [TXNID]
Amount: ৳[AMOUNT]
Date: [DATE & TIME]
Verify at: encryptuniversity.edu/payment-receipt
```

---

## 🚀 Future Enhancements

- [ ] WhatsApp API integration for SMS + media
- [ ] Email notifications alongside SMS
- [ ] SMS scheduling for bulk reminders
- [ ] Delivery confirmation tracking
- [ ] Two-way SMS for payment confirmation codes
- [ ] Multi-language SMS templates

---

## 📞 Support

For questions or issues with SMS integration:
- Admin Panel: Check SMS Logs
- Backend Logs: `backend/sms_log.txt`
- Database: Query `sms_logs` table

---

**Last Updated:** March 17, 2026
**Status:** ✅ Ready for Production Integration
