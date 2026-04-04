<?php
/**
 * Admin - Get all fees or filter by student
 * GET /admin/fees?student_id=10&status=pending
 */

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;
$status = $_GET['status'] ?? null; // pending, paid, overdue
$limit = $_GET['limit'] ?? 100;

try {
    $query = '
        SELECT 
            f.id,
            f.student_id,
            u.first_name,
            u.last_name,
            u.email,
            f.description,
            f.amount,
            f.due_date,
            f.status,
            COUNT(p.id) as payment_count,
            SUM(p.amount_paid) as total_paid,
            STRING_AGG(p.payment_method, \', \') as payment_methods,
            CASE 
                WHEN CAST(f.due_date AS DATE) < CAST(GETDATE() AS DATE) AND f.status = \'pending\' THEN \'overdue\'
                ELSE f.status
            END as current_status
        FROM fees f
        JOIN users u ON f.student_id = u.id
        LEFT JOIN payments p ON f.id = p.fee_id
        WHERE 1=1
    ';
    
    $params = [];
    
    if ($student_id) {
        $query .= ' AND f.student_id = ?';
        $params[] = $student_id;
    }
    
    if ($status) {
        if ($status === 'overdue') {
            $query .= ' AND CAST(f.due_date AS DATE) < CAST(GETDATE() AS DATE) AND f.status = \'pending\'';
        } elseif ($status === 'pending') {
            $query .= ' AND f.status = \'pending\' AND CAST(f.due_date AS DATE) >= CAST(GETDATE() AS DATE)';
        } else {
            $query .= ' AND f.status = ?';
            $params[] = $status;
        }
    }
    
    $query .= ' GROUP BY f.id, f.student_id, u.first_name, u.last_name, u.email, f.description, f.amount, f.due_date, f.status
    ORDER BY f.due_date DESC
    OFFSET 0 ROWS FETCH NEXT ? ROWS ONLY';
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameters in order
    $paramIndex = 1;
    if ($student_id) {
        $stmt->bindParam($paramIndex++, $student_id, PDO::PARAM_INT);
    }
    if ($status && !in_array($status, ['overdue', 'pending', 'due'])) {
        $stmt->bindParam($paramIndex++, $status, PDO::PARAM_STR);
    }
    $stmt->bindParam($paramIndex, $limit, PDO::PARAM_INT);
    
    $stmt->execute();

    $fees = $stmt->fetchAll();

    // Map to include explicit current_status for frontend clarity
    foreach ($fees as &$fee) {
        $due = new DateTime($fee['due_date']);
        $today = new DateTime();
        $feeStatus = $fee['status'];

        if ($feeStatus === 'paid') {
            $fee['current_status'] = 'paid';
        } elseif ($feeStatus === 'pending') {
            if ($due < $today) {
                $fee['current_status'] = 'overdue';
            } elseif ($due->format('Y-m-d') === $today->format('Y-m-d')) {
                $fee['current_status'] = 'due';
            } else {
                $fee['current_status'] = 'pending';
            }
        } else {
            $fee['current_status'] = $feeStatus;
        }
    }

    echo json_encode([
        'success' => true,
        'fees' => $fees
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
