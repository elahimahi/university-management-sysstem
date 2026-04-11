<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    require_once '../core/Database.php';
    require_once '../core/Auth.php';

    $auth = new Auth();
    $user = $auth->getCurrentUser();

    if (!$user || !in_array($user['role'], ['super_admin', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (!$data || !isset($data['name']) || !isset($data['amount']) || !isset($data['due_date'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    $name = trim($data['name']);
    $amount = floatval($data['amount']);
    $description = trim($data['description'] ?? '');
    $due_date = $data['due_date'];
    $academic_year = trim($data['academic_year'] ?? date('Y'));
    $semester = trim($data['semester'] ?? '');
    $status = $data['status'] ?? 'active';

    // Validate amount
    if ($amount <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Amount must be greater than 0']);
        exit;
    }

    // Check duplicate fee name for same academic year and semester
    $checkQuery = "SELECT id FROM fees WHERE name = ? AND academic_year = ? AND semester = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([$name, $academic_year, $semester]);

    if ($checkStmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Fee with this name already exists for this period']);
        exit;
    }

    // Insert fee
    $query = "INSERT INTO fees (name, amount, description, due_date, academic_year, semester, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())";

    $stmt = $conn->prepare($query);
    $stmt->execute([$name, $amount, $description, $due_date, $academic_year, $semester, $status]);

    $insertId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Fee structure created successfully',
        'data' => [
            'id' => $insertId,
            'name' => $name,
            'amount' => $amount,
            'description' => $description,
            'due_date' => $due_date,
            'academic_year' => $academic_year,
            'semester' => $semester,
            'status' => $status
        ]
    ]);

} catch (Exception $e) {
    error_log("Create fee structure error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create fee structure'
    ]);
}
?>
