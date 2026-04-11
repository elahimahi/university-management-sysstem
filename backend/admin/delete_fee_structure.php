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
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing fee ID']);
        exit;
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    $id = intval($data['id']);

    // Check if fee exists
    $checkQuery = "SELECT id FROM fees WHERE id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([$id]);

    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Fee not found']);
        exit;
    }

    // Check if fee has been assigned to students
    $assignedQuery = "SELECT COUNT(*) as count FROM student_fees WHERE fee_id = ?";
    $assignedStmt = $conn->prepare($assignedQuery);
    $assignedStmt->execute([$id]);
    $assigned = $assignedStmt->fetch(PDO::FETCH_ASSOC);

    if ($assigned['count'] > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Cannot delete fee as it has been assigned to students',
            'details' => "This fee has been assigned to {$assigned['count']} students"
        ]);
        exit;
    }

    // Delete fee
    $query = "DELETE FROM fees WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Fee structure deleted successfully'
    ]);

} catch (Exception $e) {
    error_log("Delete fee structure error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete fee structure'
    ]);
}
?>
