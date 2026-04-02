<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

// Fallback for some server configurations
if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized - No token found']);
    exit;
}

$token = $matches[1];
$userId = verifyToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid or expired token']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user) {
            echo json_encode([
                'id' => $user['id'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'phone' => $user['phone'],
                'role' => $user['role'],
                'isEmailVerified' => (bool)$user['is_email_verified'],
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $firstName = $data['firstName'] ?? null;
        $lastName = $data['lastName'] ?? null;
        $phone = $data['phone'] ?? null;
        
        $updateFields = [];
        $updateValues = [];
        
        if ($firstName !== null) {
            $updateFields[] = 'first_name = ?';
            $updateValues[] = $firstName;
        }
        if ($lastName !== null) {
            $updateFields[] = 'last_name = ?';
            $updateValues[] = $lastName;
        }
        if ($phone !== null) {
            $updateFields[] = 'phone = ?';
            $updateValues[] = $phone;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['message' => 'No valid fields to update']);
            exit;
        }
        
        $updateValues[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . ", updated_at = GETDATE() WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($updateValues);
        
        echo json_encode(['message' => 'Profile updated successfully']);
    } else {
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch user: ' . $e->getMessage()]);
}
?>
