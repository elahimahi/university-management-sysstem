<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Get authorization token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$userId = verifyToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

try {
    // Get user role to verify they're student
    $userStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();

    if ($user['role'] !== 'student') {
        http_response_code(403);
        echo json_encode(['message' => 'Only students can log login activity']);
        exit;
    }

    // Record login activity
    $stmt = $pdo->prepare("
        INSERT INTO login_history (user_id, login_at, ip_address, user_agent)
        VALUES (?, GETDATE(), ?, ?)
    ");
    
    $stmt->execute([
        $userId,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Login recorded',
        'user_id' => $userId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
