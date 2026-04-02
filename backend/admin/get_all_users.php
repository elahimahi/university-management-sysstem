<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("
        SELECT 
            id, 
            email, 
            first_name, 
            last_name, 
            role, 
            approval_status,
            created_at,
            updated_at
        FROM users 
        ORDER BY created_at DESC
    ");
    
    $users = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'users' => $users,
        'total' => count($users)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
