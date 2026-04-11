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
    if (!$data || !isset($data['id']) || !isset($data['name']) || !isset($data['amount'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    $id = intval($data['id']);
    $name = trim($data['name']);
    $amount = floatval($data['amount']);
    $description = trim($data['description'] ?? '');
    $due_date = $data['due_date'] ?? null;
    $status = $data['status'] ?? 'active';

    // Validate amount
    if ($amount <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Amount must be greater than 0']);
        exit;
    }

    // Check if fee exists
    $checkQuery = "SELECT id FROM fees WHERE id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([$id]);

    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Fee not found']);
        exit;
    }

    // Update fee
    if ($due_date) {
        $query = "UPDATE fees SET name = ?, amount = ?, description = ?, due_date = ?, status = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$name, $amount, $description, $due_date, $status, $id]);
    } else {
        $query = "UPDATE fees SET name = ?, amount = ?, description = ?, status = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$name, $amount, $description, $status, $id]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Fee structure updated successfully',
        'data' => [
            'id' => $id,
            'name' => $name,
            'amount' => $amount,
            'description' => $description,
            'status' => $status
        ]
    ]);

} catch (Exception $e) {
    error_log("Update fee structure error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update fee structure'
    ]);
}
?>
