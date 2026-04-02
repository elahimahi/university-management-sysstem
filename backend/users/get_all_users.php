<?php
require_once __DIR__ . '/../core/db_connect.php';

try {
    // Get all users
    $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role FROM users");
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'total_users' => count($users),
        'users' => $users
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
