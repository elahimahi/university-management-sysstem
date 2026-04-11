-- ============================================
-- FEE MANAGEMENT SYSTEM DATABASE SCHEMA
-- SQL Server (T-SQL)
-- ============================================

-- ============================================
-- 1. FEES TABLE
-- ============================================
-- Stores fee structure templates that apply to all students
-- Admin creates these, then they are assigned to students

IF OBJECT_ID('fees', 'U') IS NOT NULL 
    DROP TABLE fees;

CREATE TABLE fees (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description NVARCHAR(MAX),
    due_date DATETIME NOT NULL,
    academic_year NVARCHAR(4),
    semester NVARCHAR(50),
    status NVARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT pk_fees PRIMARY KEY (id),
    CONSTRAINT ck_fees_amount CHECK (amount > 0),
    CONSTRAINT ck_fees_status CHECK (status IN ('active', 'inactive'))
);

-- ============================================
-- 2. STUDENT_FEES TABLE (Junction Table)
-- ============================================
-- Links students to fees assigned to them
-- Tracks payment status for each student's fee

IF OBJECT_ID('student_fees', 'U') IS NOT NULL 
    DROP TABLE student_fees;

CREATE TABLE student_fees (
    id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    fee_id INT NOT NULL,
    payment_status NVARCHAR(50) DEFAULT 'unpaid',
    payment_date DATETIME,
    transaction_id NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT pk_student_fees PRIMARY KEY (id),
    CONSTRAINT fk_student_fees_user FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_fees_fee FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
    CONSTRAINT ck_student_fees_status CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
    UNIQUE (student_id, fee_id)
);

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
-- Transaction log for all payments made
-- Stores payment history for auditing and reconciliation

IF OBJECT_ID('payments', 'U') IS NOT NULL 
    DROP TABLE payments;

CREATE TABLE payments (
    id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    fee_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    gateway NVARCHAR(50) NOT NULL,
    transaction_id NVARCHAR(100) UNIQUE,
    reference_id NVARCHAR(100),
    status NVARCHAR(50) DEFAULT 'pending',
    payment_method NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    notes NVARCHAR(MAX),
    
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_fee FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
    CONSTRAINT ck_payments_amount CHECK (amount > 0),
    CONSTRAINT ck_payments_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_due_date ON fees(due_date);
CREATE INDEX idx_fees_academic_year ON fees(academic_year, semester);

CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_fee ON student_fees(fee_id);
CREATE INDEX idx_student_fees_payment_status ON student_fees(payment_status);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_fee ON payments(fee_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);

-- ============================================
-- SAMPLE DATA (For Testing/Demo)
-- ============================================

-- Insert sample fees
INSERT INTO fees (name, amount, description, due_date, academic_year, semester, status)
VALUES 
    ('Tuition Fee', 5000.00, 'Regular semester tuition charges', DATEADD(day, 30, GETDATE()), '2024', 'Fall', 'active'),
    ('Library Fee', 500.00, 'Library maintenance and digital resources', DATEADD(day, 30, GETDATE()), '2024', 'Fall', 'active'),
    ('Sports Fee', 300.00, 'Campus sports and recreation facilities', DATEADD(day, 30, GETDATE()), '2024', 'Fall', 'active'),
    ('Technology Fee', 800.00, 'IT infrastructure and software licenses', DATEADD(day, 30, GETDATE()), '2024', 'Fall', 'active');

-- Note: Student fee assignments should be done through admin interface
-- To assign fees to students, use:
-- INSERT INTO student_fees (student_id, fee_id, payment_status)
-- VALUES (student_id, fee_id, 'unpaid')

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Student Fee Summary
IF OBJECT_ID('vw_student_fee_summary', 'V') IS NOT NULL 
    DROP VIEW vw_student_fee_summary;

CREATE VIEW vw_student_fee_summary AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    COUNT(sf.id) as total_fees,
    SUM(CASE WHEN sf.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN sf.payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
    SUM(CASE WHEN sf.payment_status = 'paid' THEN f.amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN sf.payment_status = 'unpaid' THEN f.amount ELSE 0 END) as total_due
FROM users u
LEFT JOIN student_fees sf ON u.id = sf.student_id
LEFT JOIN fees f ON sf.fee_id = f.id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.email;

-- View: Fee Collection Status
IF OBJECT_ID('vw_fee_collection_status', 'V') IS NOT NULL 
    DROP VIEW vw_fee_collection_status;

CREATE VIEW vw_fee_collection_status AS
SELECT 
    f.id,
    f.name,
    f.amount,
    f.academic_year,
    f.semester,
    COUNT(sf.id) as total_assigned,
    SUM(CASE WHEN sf.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN sf.payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
    SUM(CASE WHEN sf.payment_status = 'paid' THEN f.amount ELSE 0 END) as amount_collected,
    SUM(CASE WHEN sf.payment_status = 'unpaid' THEN f.amount ELSE 0 END) as amount_pending
FROM fees f
LEFT JOIN student_fees sf ON f.id = sf.fee_id
GROUP BY f.id, f.name, f.amount, f.academic_year, f.semester;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Assign Fee to All Students
IF OBJECT_ID('sp_assign_fee_to_all_students', 'P') IS NOT NULL 
    DROP PROCEDURE sp_assign_fee_to_all_students;

CREATE PROCEDURE sp_assign_fee_to_all_students
    @fee_id INT
AS
BEGIN
    BEGIN TRY
        INSERT INTO student_fees (student_id, fee_id, payment_status)
        SELECT DISTINCT id, @fee_id, 'unpaid'
        FROM users
        WHERE role = 'student' 
        AND id NOT IN (SELECT student_id FROM student_fees WHERE fee_id = @fee_id);
        
        DECLARE @assigned INT = @@ROWCOUNT;
        SELECT 'SUCCESS' as status, @assigned as students_assigned;
    END TRY
    BEGIN CATCH
        SELECT 'ERROR' as status, ERROR_MESSAGE() as error_message;
    END CATCH
END;

-- Procedure: Calculate Overdue Fees
IF OBJECT_ID('sp_calculate_overdue_fees', 'P') IS NOT NULL 
    DROP PROCEDURE sp_calculate_overdue_fees;

CREATE PROCEDURE sp_calculate_overdue_fees
AS
BEGIN
    SELECT 
        u.id,
        u.name,
        u.email,
        f.name as fee_name,
        f.amount,
        f.due_date,
        DATEDIFF(day, f.due_date, GETDATE()) as days_overdue
    FROM users u
    JOIN student_fees sf ON u.id = sf.student_id
    JOIN fees f ON sf.fee_id = f.id
    WHERE sf.payment_status IN ('unpaid', 'pending')
    AND f.due_date < GETDATE()
    ORDER BY f.due_date ASC;
END;

-- ============================================
-- END OF SCHEMA
-- ============================================
