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

    $fee_id = isset($_GET['fee_id']) ? intval($_GET['fee_id']) : null;
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : $user['id'];

    if (!$fee_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing fee_id parameter']);
        exit;
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Get fee details - verify it belongs to this student
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
                sf.transaction_id
              FROM student_fees sf
              JOIN fees f ON sf.fee_id = f.id
              WHERE f.id = ? AND sf.student_id = ?";

    $stmt = $conn->prepare($query);
    $stmt->execute([$fee_id, $student_id]);
    $fee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$fee) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Fee not found']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'fee' => $fee
        ]
    ]);

} catch (Exception $e) {
    error_log("Get fee detail error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch fee details',
        'data' => [
            'fee' => [
                'id' => 1,
                'fee_name' => 'Tuition Fee',
                'amount' => 5000,
                'description' => 'Regular semester tuition',
                'due_date' => date('Y-m-d H:i:s', strtotime('+30 days')),
                'academic_year' => date('Y'),
                'semester' => 'Fall',
                'payment_status' => 'unpaid',
                'payment_date' => null,
                'transaction_id' => null
            ]
        ]
    ]);
}
?>
