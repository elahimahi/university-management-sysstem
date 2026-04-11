<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data) || !isset($data['course_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Course ID is required']);
    exit;
}

$courseId = intval($data['course_id']);
error_log("Attempting to delete course ID: " . $courseId);

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Step 1: Delete course assignments first (foreign key dependency)
    $stmt1 = $pdo->prepare("DELETE FROM course_assignments WHERE course_id = ?");
    $stmt1->execute([$courseId]);
    
    // Step 2: Delete grades (if they have foreign key to courses)
    $stmt2 = $pdo->prepare("DELETE FROM grades WHERE course_id = ?");
    $stmt2->execute([$courseId]);
    
    // Step 3: Now delete the course itself
    $stmt3 = $pdo->prepare("DELETE FROM courses WHERE id = ?");
    $stmt3->execute([$courseId]);
    
    // Commit transaction
    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course and related records deleted successfully'
    ]);

} catch (PDOException $e) {
    // Rollback on error
    $pdo->rollBack();
    error_log("Delete course error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Cannot delete course: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Rollback on error
    $pdo->rollBack();
    error_log("Delete course error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>
