# 📋 Fee Management System - Complete Integration Guide

## 🎯 System Overview

This is a comprehensive fee management system for the University Management System that allows:
- **Super Admins**: Create and manage fee structures for all students
- **Students**: View assigned fees and make payments through secure payment gateway
- **Finance Officers**: Track payment status and generate reports

---

## 📁 File Structure

### Frontend Components (React)
```
src/pages/
├── admin/
│   └── AdminFeeManagementPageProfessional.tsx (350+ lines)
├── student/
│   ├── StudentFeesPortalProfessional.tsx (350+ lines)
│   └── StudentPaymentPageProfessional.tsx (400+ lines)
```

### Backend Endpoints (PHP)
```
backend/
├── admin/
│   ├── get_fee_structures.php
│   ├── create_fee_structure.php
│   ├── update_fee_structure.php
│   └── delete_fee_structure.php
├── student/
│   ├── get_my_fees.php
│   ├── get_fee_detail.php
│   └── process_payment.php
└── setup_fee_schema.sql
```

---

## ⚙️ Database Setup

### Step 1: Execute SQL Schema

Run the SQL script in MS SQL Server:

```bash
sqlcmd -S YOUR_SERVER -U YOUR_USER -P YOUR_PASSWORD -d university_management -i setup_fee_schema.sql
```

Or use SQL Server Management Studio:
1. Open `backend/setup_fee_schema.sql`
2. Execute all queries
3. Verify tables created:
   - `fees` (fee structures)
   - `student_fees` (student fee assignments)
   - `payments` (transaction log)

### Tables Created

#### 1. `fees` Table
Stores fee structure templates:
```sql
- id (PK, IDENTITY)
- name (NVARCHAR 200)
- amount (DECIMAL 10,2)
- description (NVARCHAR MAX)
- due_date (DATETIME)
- academic_year (NVARCHAR 4)
- semester (NVARCHAR 50)
- status (active/inactive)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### 2. `student_fees` Table
Links students to assigned fees:
```sql
- id (PK, IDENTITY)
- student_id (FK → users.id)
- fee_id (FK → fees.id)
- payment_status (unpaid/pending/paid/failed)
- payment_date (DATETIME)
- transaction_id (NVARCHAR 100)
- created_at (DATETIME)
- updated_at (DATETIME)
UNIQUE (student_id, fee_id)
```

#### 3. `payments` Table
Transaction log for all payments:
```sql
- id (PK, IDENTITY)
- student_id (FK → users.id)
- fee_id (FK → fees.id)
- amount (DECIMAL 10,2)
- gateway (sslcommerz/stripe/etc.)
- transaction_id (NVARCHAR 100 UNIQUE)
- reference_id (NVARCHAR 100)
- status (pending/processing/completed/failed/refunded)
- payment_method (NVARCHAR 50)
- created_at (DATETIME)
- updated_at (DATETIME)
- notes (NVARCHAR MAX)
```

---

## 🛣️ Route Setup

### Update `src/routes/AppRoutes.tsx`

Add these routes to the appropriate sections:

```typescript
// Admin Routes
<Route path="/admin/fees" element={<AdminFeeManagementPageProfessional />} />

// Student Routes
<Route path="/student/fees" element={<StudentFeesPortalProfessional />} />
<Route path="/student/pay-fee/:feeId" element={<StudentPaymentPageProfessional />} />
```

### Update Navigation

Add links in dashboards:

**For Admin Dashboard** (`src/pages/admin/AdminDashboard.tsx`):
```typescript
{
  icon: CreditCard,
  label: 'Fee Management',
  path: '/admin/fees',
  color: 'text-purple-400'
}
```

**For Student Dashboard** (`src/pages/student/StudentDashboard.tsx`):
```typescript
{
  icon: DollarSign,
  label: 'My Fees',
  path: '/student/fees',
  color: 'text-green-400'
}
```

---

## 🎨 Frontend Components

### 1. AdminFeeManagementPageProfessional.tsx
**Purpose**: Administrator interface for creating and managing fee structures

**Key Features**:
- ✅ Create new fee structures
- ✅ Edit existing fees
- ✅ Delete unused fees
- ✅ Search with real-time filtering
- ✅ Filter by status (active/inactive)
- ✅ Statistics dashboard (total fees, active count, total amount)
- ✅ Modal form with validation
- ✅ Framer Motion animations
- ✅ Toast notifications for feedback

**Form Fields**:
- Fee Name (required)
- Amount (required, must be > 0)
- Description
- Due Date (required)
- Academic Year
- Semester
- Status (active/inactive)

**API Endpoints Used**:
- GET `/admin/get_fee_structures.php` - Fetch all fees
- POST `/admin/create_fee_structure.php` - Create fee
- POST `/admin/update_fee_structure.php` - Update fee
- POST `/admin/delete_fee_structure.php` - Delete fee

**How to Use**:
1. Navigate to `/admin/fees`
2. Click "Add New Fee" button
3. Fill in form and submit
4. View all fees in grid
5. Edit or delete using action buttons

---

### 2. StudentFeesPortalProfessional.tsx
**Purpose**: Student interface to view assigned fees and make payments

**Key Features**:
- ✅ View all assigned fees
- ✅ Real-time statistics (total due, total paid, overdue amount)
- ✅ Filter by status (all/pending/paid/overdue)
- ✅ Automatic overdue detection
- ✅ Status badges with color coding
- ✅ Payment initiation ("Pay Now" button)
- ✅ Receipt download for paid fees
- ✅ Transaction ID tracking
- ✅ Important payment deadline notice

**Fee Status Indicators**:
- 🟢 **Paid** (green): Payment completed with transaction ID
- 🟡 **Pending** (yellow): Awaiting payment, within due date
- 🔴 **Overdue** (red): Past due date, payment required

**Statistics Display**:
- Total Amount Due (sum of unpaid)
- Total Paid (sum of completed payments)
- Total Overdue (sum of past-due unpaid)
- Pending Count (number of unpaid fees)
- Paid Count (number of paid fees)
- Overdue Count (number of overdue fees)

**API Endpoints Used**:
- GET `/student/get_my_fees.php?student_id={id}` - Fetch student fees

**How to Use**:
1. Navigate to `/student/fees`
2. View all assigned fees
3. Use filter buttons to filter by status
4. Click "Pay Now" on any pending/overdue fee
5. Proceed to payment page

---

### 3. StudentPaymentPageProfessional.tsx
**Purpose**: Secure payment processing interface

**Key Features**:
- ✅ Two-step checkout (Review → Payment)
- ✅ Multiple payment gateway support (SSLCommerz, Stripe)
- ✅ Card payment form with validation
- ✅ Cardholder name input
- ✅ Card number with auto-formatting
- ✅ Expiry date (MM/YY)
- ✅ CVV security code
- ✅ Order summary sidebar
- ✅ Security notices
- ✅ Processing indicator with loading state

**Payment Gateways Supported**:
- SSLCommerz (Bangladesh primary)
- Stripe (International)

**Form Validation**:
- All fields required
- Card number: 16 digits, auto-formatted `XXXX XXXX XXXX XXXX`
- Expiry: MM/YY format
- CVV: 3-4 digits masked input
- Amount validation matches database

**Two-Step Process**:

**Step 1: Review**
- Display fee details
- Show amount due
- Display due date
- Show SSL secure badge

**Step 2: Payment**
- Select payment gateway
- Enter card holder name
- Enter card details
- Click "Pay" button
- Process payment

**API Endpoints Used**:
- GET `/student/get_fee_detail.php?fee_id={id}&student_id={id}` - Get fee details
- POST `/student/process_payment.php` - Process payment

**How to Use**:
1. Comes from StudentFeesPortalProfessional "Pay Now" button
2. Step 1: Review fee details and click "Proceed to Payment"
3. Step 2: Select payment method (SSLCommerz or Stripe)
4. Enter cardholder name
5. Enter card details
6. Click "Pay" button
7. On success: Redirect to fees portal with confirmation

---

## 🔌 Backend Endpoints

### Admin Endpoints

#### 1. GET `/admin/get_fee_structures.php`
**Description**: Fetch all fee structures with search and filter

**Query Parameters**:
- `search` (optional): Search by fee name
- `status` (optional): Filter by status (active/inactive)

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "fees": [
      {
        "id": 1,
        "name": "Tuition Fee",
        "amount": 5000,
        "description": "Regular semester tuition",
        "due_date": "2024-12-31T00:00:00",
        "academic_year": "2024",
        "semester": "Fall",
        "status": "active",
        "created_at": "2024-01-15T10:30:00"
      }
    ],
    "stats": {
      "total_count": 5,
      "active_count": 4,
      "total_amount": 18300
    }
  }
}
```

**Response Error** (403/500):
- 403: Unauthorized (not admin)
- 500: Database error (returns fallback data)

---

#### 2. POST `/admin/create_fee_structure.php`
**Description**: Create a new fee structure

**Request Body**:
```json
{
  "name": "Tuition Fee",
  "amount": 5000,
  "description": "Regular semester tuition",
  "due_date": "2024-12-31T00:00:00",
  "academic_year": "2024",
  "semester": "Fall",
  "status": "active"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Fee structure created successfully",
  "data": {
    "id": 1,
    "name": "Tuition Fee",
    "amount": 5000,
    "status": "active"
  }
}
```

**Response Error** (400/403/500):
- 400: Missing required fields or duplicate fee name
- 403: Unauthorized (not admin)
- 500: Database error

---

#### 3. POST `/admin/update_fee_structure.php`
**Description**: Update an existing fee structure

**Request Body**:
```json
{
  "id": 1,
  "name": "Updated Fee Name",
  "amount": 5500,
  "description": "Updated description",
  "due_date": "2024-12-31T00:00:00",
  "status": "active"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Fee structure updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Fee Name",
    "amount": 5500,
    "status": "active"
  }
}
```

**Response Error** (400/403/404/500):
- 400: Invalid data
- 403: Unauthorized
- 404: Fee not found
- 500: Database error

---

#### 4. POST `/admin/delete_fee_structure.php`
**Description**: Delete a fee structure (only if not assigned to students)

**Request Body**:
```json
{
  "id": 1
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Fee structure deleted successfully"
}
```

**Response Error** (400/403/404/500):
- 400: Fee is assigned to students
- 403: Unauthorized
- 404: Fee not found
- 500: Database error

---

### Student Endpoints

#### 1. GET `/student/get_my_fees.php`
**Description**: Fetch all fees assigned to the logged-in student

**Query Parameters**: None (uses authenticated user ID)

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "fees": [
      {
        "id": 1,
        "fee_name": "Tuition Fee",
        "amount": 5000,
        "description": "Regular semester tuition",
        "due_date": "2024-12-31T00:00:00",
        "academic_year": "2024",
        "semester": "Fall",
        "payment_status": "unpaid",
        "payment_date": null,
        "transaction_id": null,
        "status": "pending"
      }
    ],
    "stats": {
      "total_due": 5000,
      "total_paid": 0,
      "total_overdue": 0,
      "pending_count": 1,
      "paid_count": 0,
      "overdue_count": 0
    }
  }
}
```

**Response Error** (403/500):
- 403: Unauthorized (not student)
- 500: Database error (returns fallback data)

---

#### 2. GET `/student/get_fee_detail.php`
**Description**: Fetch details for a specific fee assigned to student

**Query Parameters**:
- `fee_id` (required): Fee ID
- `student_id` (optional): Student ID (uses auth if not provided)

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "fee": {
      "id": 1,
      "fee_name": "Tuition Fee",
      "amount": 5000,
      "description": "Regular semester tuition",
      "due_date": "2024-12-31T00:00:00",
      "academic_year": "2024",
      "semester": "Fall",
      "payment_status": "unpaid",
      "payment_date": null,
      "transaction_id": null
    }
  }
}
```

**Response Error** (400/403/404/500):
- 400: Missing fee_id
- 403: Unauthorized
- 404: Fee not found for this student
- 500: Database error

---

#### 3. POST `/student/process_payment.php`
**Description**: Process payment for a fee

**Request Body**:
```json
{
  "fee_id": 1,
  "student_id": 123,
  "amount": 5000,
  "gateway": "sslcommerz",
  "card_holder_name": "John Doe",
  "card_last_four": "1234",
  "transaction_id": "TXN-1234567890"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": "TXN-1234567890",
    "amount": 5000,
    "status": "completed",
    "payment_date": "2024-01-15T10:30:00",
    "gateway": "sslcommerz"
  }
}
```

**Response Error** (400/403/404/500):
- 400: Missing payment info or amount mismatch
- 403: Unauthorized
- 404: Fee not found
- 500: Processing error

**Important Notes**:
- In production, integrate with actual payment gateway
- Currently simulates successful payment for demo
- Updates `student_fees` and `payments` tables
- Creates permanent transaction record

---

## 💳 Payment Gateway Integration

### SSLCommerz Integration (Bangladesh)
For Bangladesh-based payments using SSLCommerz API:

1. **Get API Credentials**:
   - Register at https://sslcommerz.com
   - Get Store ID and API Key

2. **Implementation Location**:
   - Create `backend/payment/sslcommerz.php`
   - Handles payment initiation and callback

3. **Payment Flow**:
   ```
   User clicks Pay
   → POST to payment/sslcommerz.php
   → Redirect to SSLCommerz gateway
   → User enters card details on SSLCommerz
   → Callback to payment/sslcommerz_callback.php
   → Update payment status in database
   → Redirect to fees portal with confirmation
   ```

### Stripe Integration (International)
For international payments using Stripe:

1. **Get API Credentials**:
   - Register at https://stripe.com
   - Get Publishable Key and Secret Key

2. **Implementation Location**:
   - Create `backend/payment/stripe.php`
   - Use Stripe PHP SDK

3. **Payment Flow**:
   ```
   User clicks Pay
   → Load Stripe payment form
   → Process payment using Stripe API
   → Handle response/error
   → Update payment status
   → Return confirmation
   ```

### Alternative Gateways (Bangladesh)
- bKash
- Nagad
- Rocket
- Dutch Bangla Bank (DBBL)

---

## 📊 Reporting & Analytics

### View: Student Fee Summary
```sql
SELECT * FROM vw_student_fee_summary
-- Shows total fees, paid, unpaid, amounts for each student
```

### View: Fee Collection Status
```sql
SELECT * FROM vw_fee_collection_status
-- Shows collection percentage for each fee
```

### Procedure: Calculate Overdue Fees
```sql
EXEC sp_calculate_overdue_fees
-- Lists all overdue fees and days past due
```

### Procedure: Assign Fee to All Students
```sql
EXEC sp_assign_fee_to_all_students @fee_id = 1
-- Automatically assigns a fee to all students
```

---

## 🔒 Security Considerations

1. **Role-Based Access Control**:
   - Only `super_admin` and `admin` roles can manage fees
   - Only `student` role can pay fees
   - Backend verifies role before each operation

2. **Data Validation**:
   - All inputs sanitized
   - Required fields enforced
   - Amount must be > 0
   - Transaction ID unique constraint

3. **SQL Injection Prevention**:
   - Prepared statements used everywhere
   - PDO parameterized queries
   - No string concatenation in queries

4. **Payment Security**:
   - Card information never stored locally
   - Use actual payment gateway tokens
   - HTTPS encryption in production
   - Payment gateway handles PCI compliance

5. **Audit Trail**:
   - All transactions logged in `payments` table
   - `created_at` and `updated_at` timestamps
   - Transaction IDs for traceability

---

## 🧪 Testing Checklist

### Admin Tests
- [ ] Create new fee structure
- [ ] Edit existing fee
- [ ] Delete unused fee
- [ ] Search fees by name
- [ ] Filter by status (active/inactive)
- [ ] View statistics
- [ ] Create duplicate fee name (should fail)
- [ ] Create fee with 0 amount (should fail)

### Student Tests
- [ ] View all assigned fees
- [ ] See correct statistics
- [ ] Filter by status (pending/paid/overdue)
- [ ] Click "Pay Now" button
- [ ] Should redirect to payment page
- [ ] Verify fee details on payment page

### Payment Tests
- [ ] Review step displays correct info
- [ ] Proceed to payment step
- [ ] Select payment gateway
- [ ] Enter card details
- [ ] Validate all fields required
- [ ] Submit payment
- [ ] Should process and redirect
- [ ] Payment status should update to "paid"
- [ ] Transaction ID should be recorded

### Backend Tests
- [ ] GET fee structures returns correct format
- [ ] POST create validates all fields
- [ ] POST update prevents duplicate names
- [ ] POST delete prevents if assigned
- [ ] Student fees endpoint returns only user's fees
- [ ] Payment updates database correctly
- [ ] Error responses include fallback data

---

## 📝 Implementation Checklist

### Phase 1: Database Setup ✅
- [x] Create SQL schema
- [x] Create tables (fees, student_fees, payments)
- [x] Create indexes for performance
- [x] Create views for reporting
- [x] Create stored procedures
- [x] Insert sample data

### Phase 2: Frontend ✅
- [x] Create AdminFeeManagementPageProfessional.tsx
- [x] Create StudentFeesPortalProfessional.tsx
- [x] Create StudentPaymentPageProfessional.tsx
- [x] Add animations and styling
- [x] Add form validation
- [x] Add error handling
- [x] Test responsive design

### Phase 3: Backend ✅
- [x] Create admin endpoints (4 files)
- [x] Create student endpoints (3 files)
- [x] Add authentication checks
- [x] Add error handling with fallback data
- [x] Implement data validation
- [x] Test with Postman/Thunder Client

### Phase 4: Integration 🔄
- [ ] Update AppRoutes.tsx with new routes
- [ ] Add navigation links to dashboards
- [ ] Test end-to-end flow
- [ ] Verify database updates
- [ ] Check payment status tracking
- [ ] Validate audit trail

### Phase 5: Payment Gateway 🔄
- [ ] Choose payment provider
- [ ] Get API credentials
- [ ] Implement payment integration
- [ ] Test payment processing
- [ ] Handle payment callbacks
- [ ] Implement error recovery

### Phase 6: Deployment 🔄
- [ ] Run SQL schema on production
- [ ] Deploy backend files
- [ ] Deploy frontend components
- [ ] Update routes
- [ ] Test in production
- [ ] Monitor for errors

---

## 🆘 Troubleshooting

### Issue: "Unauthorized access" error
**Cause**: User role is not super_admin/admin
**Solution**: Check user role in database, ensure logged in as admin

### Issue: Fee not assigned to student
**Cause**: student_fees table doesn't have entry
**Solution**: Use admin dashboard to assign fees, or run stored procedure

### Issue: Payment not updating status
**Cause**: process_payment endpoint not connecting to payment gateway
**Solution**: Implement actual payment gateway integration

### Issue: "Duplicate fee" error
**Cause**: Fee name + academic_year + semester already exists
**Solution**: Use different name or different period

### Issue: 500 error on endpoints
**Cause**: Database connection or SQL error
**Solution**: Check database connectivity, review error log

---

## 📞 Support

For integration help:
1. Review backend error logs
2. Check database tables for data
3. Verify role-based access
4. Test endpoints with Postman
5. Review MySQL/SQL queries

---

## 📄 License & Credits

This fee management system is part of the University Management System project.

**Developed**: 2024
**Version**: 1.0
**Status**: Production Ready (except payment gateway - needs integration)

---

## 🚀 Next Steps

1. Execute SQL schema in your MS SQL Server
2. Add routes to AppRoutes.tsx
3. Update dashboard navigation
4. Test all endpoints with Postman
5. Integrate actual payment gateway
6. Deploy to production
7. Monitor and maintain

---

**Last Updated**: January 2024
**Maintainer**: University Management System Team
