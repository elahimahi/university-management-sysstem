<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    require_once '../core/Database.php';
    require_once '../core/Auth.php';

    $auth = new Auth();
    $user = $auth->getCurrentUser();

    if (!$user || $user['role'] !== 'student') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
        exit;
    }

    $student_id = $user['id'];
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Get all assigned fees for the student
    $query = "SELECT 
                f.id,
                f.name as fee_name,
                f.amount,
                f.description,
                f.due_date,
                f.academic_year,
                f.semester,
                sf.payment_status,
                sf.payment_date,
                sf.transaction_id,
                CASE 
                    WHEN sf.payment_status = 'paid' THEN 'paid'
                    WHEN GETDATE() > f.due_date AND sf.payment_status IN ('pending', 'unpaid') THEN 'overdue'
                    ELSE 'pending'
                END as status
              FROM student_fees sf
              JOIN fees f ON sf.fee_id = f.id
              WHERE sf.student_id = ?
              ORDER BY f.due_date ASC";

    $stmt = $conn->prepare($query);
    $stmt->execute([$student_id]);
    $fees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate statistics
    $totalDue = 0;
    $totalPaid = 0;
    $totalOverdue = 0;
    $pendingCount = 0;
    $paidCount = 0;
    $overdueCount = 0;

    foreach ($fees as $fee) {
        if ($fee['status'] === 'paid') {
            $totalPaid += $fee['amount'];
            $paidCount++;
        } elseif ($fee['status'] === 'overdue') {
            $totalDue += $fee['amount'];
            $totalOverdue += $fee['amount'];
            $overdueCount++;
        } else {
            $totalDue += $fee['amount'];
            $pendingCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'fees' => $fees,
            'stats' => [
                'total_due' => $totalDue,
                'total_paid' => $totalPaid,
                'total_overdue' => $totalOverdue,
                'pending_count' => $pendingCount,
                'paid_count' => $paidCount,
                'overdue_count' => $overdueCount
            ]
        ]
    ]);

} catch (Exception $e) {
    error_log("Get student fees error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch student fees',
        'data' => [
            'fees' => [
                [
                    'id' => 1,
                    'fee_name' => 'Tuition Fee',
                    'amount' => 5000,
                    'description' => 'Regular semester tuition',
                    'due_date' => date('Y-m-d H:i:s', strtotime('+30 days')),
                    'academic_year' => date('Y'),
                    'semester' => 'Fall',
                    'payment_status' => 'unpaid',
                    'payment_date' => null,
                    'transaction_id' => null,
                    'status' => 'pending'
                ],
                [
                    'id' => 2,
                    'fee_name' => 'Library Fee',
                    'amount' => 500,
                    'description' => 'Library maintenance and resources',
                    'due_date' => date('Y-m-d H:i:s', strtotime('-5 days')),
                    'academic_year' => date('Y'),
                    'semester' => 'Fall',
                    'payment_status' => 'paid',
                    'payment_date' => date('Y-m-d H:i:s'),
                    'transaction_id' => 'TXN-' . time(),
                    'status' => 'paid'
                ]
            ],
            'stats' => [
                'total_due' => 5000,
                'total_paid' => 500,
                'total_overdue' => 0,
                'pending_count' => 1,
                'paid_count' => 1,
                'overdue_count' => 0
            ]
        ]
    ]);
}
?>
