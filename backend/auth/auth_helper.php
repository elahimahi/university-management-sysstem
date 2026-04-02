<?php
require_once __DIR__ . '/../core/db_connect.php';

// JWT-like token simulation (Head.Payload.Sig)
function generateToken($userId) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'sub' => $userId,
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + 3600
    ]));
    $signature = base64_encode('mock_signature');
    return "$header.$payload.$signature";
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) < 2) return false;
    
    $payload = json_decode(base64_decode($parts[1]), true);
    if ($payload && isset($payload['exp']) && $payload['exp'] > time()) {
        return $payload['user_id'];
    }
    return false;
}

function getAuthenticatedUser() {
    // Get Authorization header - try multiple ways to ensure we get it
    $authHeader = '';
    
    // Method 1: getallheaders() (Apache)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    // Method 2: $_SERVER (Fallback for other servers)
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    // Method 3: Check alternative header names
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $userId = verifyToken($token);
        
        if ($userId) {
            global $pdo;
            $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }
    return false;
}

function requireAuth() {
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
        exit();
    }
    return $user;
}

function requireRole($role) {
    $user = requireAuth();
    if ($user['role'] !== $role) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Insufficient permissions']);
        exit();
    }
    return $user;
}

function requireFacultyAuth() {
    return requireRole('faculty');
}

function requireStudentAuth() {
    return requireRole('student');
}

function requireAdminAuth() {
    return requireRole('admin');
}
?>
