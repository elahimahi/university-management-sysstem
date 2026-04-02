<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data['course_id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Course ID is required']);
        exit;
    }

    // Check if course exists
    $checkQuery = "SELECT id FROM courses WHERE id = ?";
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute([$data['course_id']]);

    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Course not found']);
        exit;
    }

    // Delete course (consider soft delete if needed)
    $deleteQuery = "DELETE FROM courses WHERE id = ?";
    $stmt = $pdo->prepare($deleteQuery);
    $result = $stmt->execute([$data['course_id']]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete course']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
