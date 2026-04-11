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
    error_log('[verifyToken] Verifying token: ' . substr($token, 0, 30) . '...');
    
    $parts = explode('.', $token);
    if (count($parts) < 2) {
        error_log('[verifyToken] Invalid token format - not 3 parts');
        return false;
    }
    
    $payload = json_decode(base64_decode($parts[1]), true);
    error_log('[verifyToken] Payload decoded: ' . json_encode($payload));
    
    if (!$payload) {
        error_log('[verifyToken] Failed to decode payload');
        return false;
    }
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] <= time()) {
        error_log('[verifyToken] Token expired. exp=' . $payload['exp'] . ', now=' . time());
        return false;
    }
    
    // Try to find user_id from either 'user_id' or 'sub' field
    $userId = $payload['user_id'] ?? $payload['sub'] ?? null;
    error_log('[verifyToken] Extracted userId: ' . ($userId ?: 'null'));
    
    return $userId ? (int)$userId : false;
}

function getAuthenticatedUser() {
    // Get Authorization header - try multiple ways to ensure we get it
    $authHeader = '';

    // Method 1: getallheaders() (Apache)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }

    // Method 2: apache_request_headers() fallback
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }

    // Method 3: $_SERVER (Fallback for other servers)
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    // Method 4: Alternative header names
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (!$authHeader && isset($_SERVER['Authorization'])) {
        $authHeader = $_SERVER['Authorization'];
    }

    error_log('[getAuthenticatedUser] Auth header: ' . substr($authHeader, 0, 50));

    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        error_log('[getAuthenticatedUser] Extracted token: ' . substr($token, 0, 30) . '...');
        $userId = verifyToken($token);

        if ($userId) {
            error_log('[getAuthenticatedUser] User authenticated: userId=' . $userId);
            global $pdo;
            $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role, approval_status FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $user['approval_status'] = $user['approval_status'] ?? 'approved';
            }
            return $user;
        } else {
            error_log('[getAuthenticatedUser] Token verification failed');
        }
    } else {
        error_log('[getAuthenticatedUser] Bearer pattern not matched');
    }
    return false;
}

function normalizeRole($role) {
    return strtolower(trim((string)$role));
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
    $normalizedRole = normalizeRole($user['role'] ?? '');
    $expectedRole = normalizeRole($role);
    if ($normalizedRole !== $expectedRole) {
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
    $user = requireAuth();
    $role = normalizeRole($user['role'] ?? '');
    $isAdminRole = in_array($role, ['admin', 'superadmin', 'super-admin', 'super_admin'], true)
        || strpos($role, 'admin') !== false;

    if (!$isAdminRole) {
        error_log('[requireAdminAuth] Denied access for role: ' . $role);
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Insufficient permissions']);
        exit();
    }
    return $user;
}
?>
