<?php
/**
 * Update existing users with NULL approval_status to 'approved'
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    // Update all users with NULL approval_status to 'approved'
    $updateStmt = $pdo->prepare("UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL");
    $updateStmt->execute();
    
    $rowsUpdated = $updateStmt->rowCount();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => "Updated $rowsUpdated users with approval_status = 'approved'",
        'rows_updated' => $rowsUpdated
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
