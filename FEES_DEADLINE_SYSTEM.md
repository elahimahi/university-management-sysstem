# Advanced Fees Management System - Complete Guide

## Overview

This comprehensive fees management system includes:
- **Payment Deadline Windows**: Admin can set specific deadlines for fee payment
- **Multiple Payment Methods**: bKash, Nagad, Rocket, Card
- **Automatic SMS Notifications**: Confirmation, reminders, and penalty notices
- **Penalty System**: Auto-apply penalties for overdue payments
- **Real-time Status Tracking**: Students see payment deadlines and time remaining
- **Batch Processing**: Automated reminders and penalty application

---

## Features

### 1. Payment Deadline Management

#### Admin Sets Deadline
When creating a fee, the admin can specify:
- **Original Due Date**: When the fee was assigned
- **Payment Deadline**: The window during which payment must be made (extends the original due date)
- **Penalty Rate**: % of fee to charge as penalty
- **Penalty Application**: Days after deadline to automatically apply penalty

#### Student View
Students see:
- Original due date
- Payment deadline (the critical window)
- Time remaining to pay
- Penalty amount (if applicable)
- Color-coded urgency (green → yellow → red)

### 2. SMS Notification System

#### Types of SMS Sent

**a) Payment Confirmation SMS**
```
Encrypt University: পেমেন্ট নিশ্চিত!
প্রিয় [Student Name],
আপনার ৳[Amount] via [METHOD] পেমেন্ট সফল!
বকেয়া: ৳[Remaining]
বাকি ফি: [Count]
যোগাযোগ: support@encryptuniversity.edu
```

**b) Deadline Reminder SMS (24 hours before deadline)**
```
Encrypt University: অর্থপ্রদান স্মরণপত্র
প্রিয় [Student Name],
আপনার পেমেন্টের মেয়াদ শীঘ্রই শেষ হবে।
পাওয়া বাকি: ৳[Amount]
মেয়াদ: [Date & Time]
এখনই পেমেন্ট করুন।
যোগাযোগ: support@university.edu
```

**c) Penalty Notice SMS (after deadline)**
```
Encrypt University: জরুরি বিজ্ঞপ্তি
প্রিয় [Student Name],
আপনার পেমেন্ট মেয়াদ শেষ হয়ে গেছে।
মূল পরিমাণ: ৳[Original]
পেনাল্টি: ৳[Penalty]
মোট: ৳[Total]
অবিলম্বে পরিশোধ করুন।
যোগাযোগ: support@university.edu
```

### 3. Penalty System

#### How Penalties Work

1. **Admin sets penalty rate when creating fee**
   - Percentage-based (% of original amount)
   - Flat amount
   - Combined (both)

2. **System automatically applies penalty**
   - After the payment deadline passes
   - Penalties added to total amount due
   - Students notified via SMS

3. **Penalty Tracking**
   - Visible in student fees page
   - Shows penalty amount
   - Shows penalty rate applied

#### Example Scenario

```
Original Fee: ৳5,000
Due Date: April 10
Payment Deadline: April 15
Penalty Rate: 5% (percentage)

If not paid by April 15:
- Penalty = ৳5,000 × 5% = ৳250
- New Total = ৳5,250
- SMS sent: Payment overdue, penalty applied
```

---

## API Endpoints

### Admin Endpoints

#### 1. Set Payment Deadline
```
PUT /admin/set_payment_deadline.php
Content-Type: application/json

{
  "fee_id": 5,
  "payment_deadline": "2026-04-15 23:59:59",
  "penalty_percentage": 5,
  "apply_after_days": 7,
  "reason": "Extended deadline for special case"
}

Response:
{
  "success": true,
  "fee_id": 5,
  "payment_deadline": "2026-04-15 23:59:59",
  "penalty_percentage": 5
}
```

#### 2. Apply Penalties (Manual)
```
POST /admin/apply_penalties.php
Content-Type: application/json

{
  "fee_id": null,  // Optional: specific fee only
  "send_sms": true
}

Response:
{
  "success": true,
  "penalties_count": 12,
  "penalties_applied": [
    {
      "fee_id": 1,
      "student_id": 10,
      "original_amount": 5000,
      "penalty_amount": 250,
      "new_total": 5250
    },
    ...
  ],
  "sms_notifications_sent": 12
}
```

#### 3. Send Deadline Reminders
```
POST /admin/send_deadline_reminders.php
Content-Type: application/json

{
  "hours_before_deadline": 24,
  "status": "pending"
}

Response:
{
  "success": true,
  "total_reminders_sent": 45,
  "total_skipped": 2,
  "total_failed": 0,
  "reminders": [...]
}
```

#### 4. Run Automated Batch Job
```
POST /admin/run_fee_batch_job.php

Response:
{
  "success": true,
  "executed_tasks": [
    {
      "task": "Send 24-hour deadline reminders",
      "status": "completed",
      "reminders_sent": 23
    },
    {
      "task": "Apply penalties to overdue fees",
      "status": "completed",
      "penalties_applied": 5
    },
    {
      "task": "Update status for overdue fees",
      "status": "completed",
      "rows_updated": 8
    }
  ],
  "execution_time": "2.34s"
}
```

### Student Endpoints

#### 1. Get Fees with Deadlines
```
POST /student/get_fees_with_deadline.php
Content-Type: application/json

{
  "student_id": 10
}

Response:
{
  "success": true,
  "fees": [
    {
      "id": 5,
      "description": "Tuition Fee",
      "amount": 5000,
      "due_date": "2026-04-10",
      "payment_deadline": "2026-04-15 23:59:59",
      "status": "pending",
      "paid_amount": 2000,
      "remaining_amount": 3000,
      "hours_remaining": 48,
      "payment_status_display": "Pending",
      "penalty_applied": false,
      "penalty_amount": 0
    }
  ],
  "summary": {
    "total_amount": 10000,
    "total_paid": 5000,
    "total_pending": 5000,
    "urgent_fees": 2,
    "overdue_fees": 0,
    "message": "You have 2 fee(s) due within 24 hours."
  }
}
```

---

## Database Schema

### New/Modified Tables

#### 1. fees (Modified)
```sql
ALTER TABLE fees ADD (
  payment_deadline DATETIME2 NULL,      -- When payment window closes
  penalty_applied BIT DEFAULT 0,        -- Has penalty been applied?
  penalty_amount DECIMAL(10, 2) DEFAULT 0  -- Amount of penalty
);
```

#### 2. penalty_config (New)
```sql
CREATE TABLE penalty_config (
  id INT PRIMARY KEY,
  fee_id INT,
  penalty_percentage DECIMAL(5, 2),
  penalty_flat_amount DECIMAL(10, 2),
  penalty_type VARCHAR(20),        -- 'percentage', 'flat', 'combined'
  apply_after_days INT,
  created_at DATETIME2
);
```

#### 3. sms_logs (New)
```sql
CREATE TABLE sms_logs (
  id INT PRIMARY KEY,
  student_id INT,
  phone_number VARCHAR(20),
  message TEXT,
  sms_type VARCHAR(50),  -- 'payment_confirmation', 'pending_reminder', 'penalty_notice'
  status VARCHAR(20),
  provider VARCHAR(50),
  sent_at DATETIME2
);
```

#### 4. payment_deadline_log (New)
```sql
CREATE TABLE payment_deadline_log (
  id INT PRIMARY KEY,
  fee_id INT,
  old_deadline DATETIME2,
  new_deadline DATETIME2,
  changed_by INT,
  changed_at DATETIME2
);
```

---

## Automation Setup

### Option 1: Linux Cron Job

Add to crontab (run every 6 hours):
```bash
0 */6 * * * curl -X POST http://localhost:8000/admin/run_fee_batch_job.php
```

Or with authentication:
```bash
0 */6 * * * curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/admin/run_fee_batch_job.php
```

### Option 2: Windows Task Scheduler

Create a batch file `run-fee-job.bat`:
```batch
@echo off
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:8000/admin/run_fee_batch_job.php' -Method 'POST'"
```

Schedule this file to run every 6 hours via Task Scheduler.

### Option 3: Manual Execution

Admin can manually trigger from dashboard:
- **Send Reminders** button → Sends 24-hour reminders
- **Apply Penalties** button → Applies penalties to overdue fees
- Or use API directly

---

## User Interface Changes

### Admin Dashboard - Fees Page

**New Features:**
1. **Top Action Buttons**
   - 📧 Send Reminders: Manually trigger deadline reminders
   - ⚠️ Apply Penalties: Manually apply penalties

2. **Enhanced Create Fee Modal**
   - Original Due Date field
   - Payment Deadline field (datetime picker)
   - Penalty % Rate field
   - Apply After (Days) field

3. **Fees Table**
   - Added Payment Deadline column
   - Shows status with deadline info
   - Color-coded urgency indicators

### Student Portal - Fees Page

**New Features:**
1. **Alert Bar**
   - Shows overdue and urgent fees
   - Clear warning messages

2. **Enhanced Fee Statistics**
   - Total pending amount
   - Urgent fees count
   - Total penalties applied

3. **Deadline Information Card**
   - Payment deadline date/time
   - Time remaining (hours/days)
   - Countdown timer

4. **Penalty Information Card**
   - Shows if penalty applied
   - Penalty amount
   - Penalty rate

5. **Payment Modal**
   - Shows payment deadline
   - Shows time remaining
   - Shows penalty amount due
   - Color-coded urgency

---

## Error Handling

The system handles various scenarios:

1. **No Payment Deadline Set**
   - Uses original due_date for status
   - Optional deadline feature

2. **Payment Made After Deadline**
   - Payment recorded as normal
   - Status changes to "paid"
   - Penalty remains (cumulative)

3. **SMS Sending Fails**
   - Logged in sms_logs with 'failed' status
   - Admin notified
   - Fee/payment still recorded

4. **Penalty Already Applied**
   - Skipped in batch job
   - Won't double-apply

---

## Configuration

### SMS Provider Setup

Edit `backend/core/sms_config.php`:

```php
// Current provider
define('SMS_PROVIDER', 'test');  // 'test', 'twilio', 'nexmo', 'bdesl'

// Twilio (if using)
define('TWILIO_ACCOUNT_SID', 'your_sid');
define('TWILIO_AUTH_TOKEN', 'your_token');
define('TWILIO_PHONE_NUMBER', '+1234567890');

// Nexmo/Vonage (if using)
define('NEXMO_API_KEY', 'your_key');
define('NEXMO_API_SECRET', 'your_secret');

// Bangladesh ESL (if using)
define('BDESL_API_KEY', 'your_key');
define('BDESL_API_URL', 'https://api.bdesl.com/api/v1/send-sms');
define('BDESL_SENDER_ID', 'YourUniversity');
```

---

## Testing

### Test Automated Batch Job

```bash
curl -X POST http://localhost:8000/admin/run_fee_batch_job.php
```

### Test SMS Logging

Check `backend/sms_log.txt` for test mode SMS attempts

### Test Endpoints with cURL

```bash
# Send reminders
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"hours_before_deadline": 24}' \
  http://localhost:8000/admin/send_deadline_reminders.php

# Apply penalties
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"send_sms": true}' \
  http://localhost:8000/admin/apply_penalties.php
```

---

## Support & Troubleshooting

### Common Issues

**Q: SMS not being sent?**
A: Check SMS_PROVIDER in config. Default is 'test' (logs only, doesn't send)

**Q: Penalties not applied?**
A: Run batch job or click "Apply Penalties" button in admin dashboard

**Q: Student not seeing deadline?**
A: Ensure payment_deadline is set when creating fee

**Q: Old fees page not working?**
A: New endpoint tries first, falls back to old endpoint automatically

---

## Summary of Files Created/Modified

### New Backend Files:
- `/backend/core/update_schema_fees.php` - Database schema updates
- `/backend/admin/set_payment_deadline.php` - Set deadlines
- `/backend/admin/apply_penalties.php` - Apply penalties
- `/backend/admin/send_deadline_reminders.php` - Send reminders
- `/backend/admin/run_fee_batch_job.php` - Automated batch job
- `/backend/student/get_fees_with_deadline.php` - Get fees with deadline info

### Modified Files:
- `/backend/core/sms_service.php` - Enhanced SMS service
- `/src/pages/student/StudentFeesPage.tsx` - Enhanced UI
- `/src/pages/admin/AdminFeesPage.tsx` - Enhanced admin UI

### Database:
- Adds: `payment_deadline`, `penalty_applied`, `penalty_amount` to fees
- Creates: `penalty_config`, `sms_logs`, `payment_deadline_log` tables

---

## Next Steps

1. Run schema update: `http://localhost:8000/admin/core/update_schema_fees.php`
2. Configure SMS provider in `backend/core/sms_config.php`
3. Set up automated batch job (cron/Task Scheduler)
4. Create fees with payment deadlines
5. Monitor SMS logs
