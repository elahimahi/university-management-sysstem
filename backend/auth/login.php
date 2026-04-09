
<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
// Must be completely first - before any output

// Set response code first
http_response_code(200);

// CORS headers - CRITICAL ORDER
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// CRITICAL: Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW load database and execute logic
// ============================================

file_put_contents(__DIR__ . '/debug.txt', 'Login endpoint hit: ' . date('c') . PHP_EOL, FILE_APPEND);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/auth_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

// Debug logging
file_put_contents('debug_login.log', "Login attempt: Email: $email | Password: $password | Role: $role\n", FILE_APPEND);

if (!$email || !$password || !$role) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email, password, and role are required']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Accept role from login request if provided (faculty/admin/student/superadmin)
        $role = isset($data['role']) && in_array($data['role'], ['student', 'faculty', 'admin', 'superadmin']) ? $data['role'] : 'student';
        
        // CRITICAL: Check if trying to create admin role when admin already exists
        if ($role === 'admin') {
            // Check if admin role already exists (but not superadmin)
            $adminCheckStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'");
            $adminCheckStmt->execute();
            $adminResult = $adminCheckStmt->fetch();
            
            if ($adminResult['admin_count'] > 0) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Admin account already exists',
                    'error' => 'Only one admin can be registered in the system. Please use a different role.'
                ]);
                exit(0);
            }
        }
        
        // Auto-register new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $firstName = $data['first_name'] ?? 'New';
        $lastName = $data['last_name'] ?? 'User';
        $isEmailVerified = 1;
        // Auto-approve only superadmin, others need approval
        $approvalStatus = ($role === 'superadmin') ? 'approved' : 'pending';
        $insertStmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insertStmt->execute([$email, $hashedPassword, $firstName, $lastName, $role, $isEmailVerified, $approvalStatus]);
        // Fetch the newly created user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    }

    if ($user && password_verify($password, $user['password'])) {
        // Allow superadmin to log in using admin role selection in the UI
        if ($user['role'] === 'superadmin' && $role === 'admin') {
            $role = 'superadmin';
        } elseif ($user['role'] !== $role) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Invalid role for this user']);
            exit;
        }
        
        // CHECK IF USER IS APPROVED (Super Admin System)
        // Auto-approve if approval_status is NULL (old users), or check if explicitly approved
        $approvalStatus = $user['approval_status'] ?? 'approved';
        
        // If approval_status was NULL, update it to 'approved' (auto-approve old users)
        if ($user['approval_status'] === NULL) {
            try {
                $updateStmt = $pdo->prepare("UPDATE users SET approval_status = 'approved' WHERE id = ?");
                $updateStmt->execute([$user['id']]);
            } catch (Exception $e) {
                // Continue even if update fails
            }
            $approvalStatus = 'approved';
        }

        // BLOCK LOGIN IF NOT APPROVED
        if ($approvalStatus !== 'approved') {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => 'Account pending approval. Please wait for superadmin approval.',
                'approval_status' => $approvalStatus,
                'rejection_reason' => $user['rejection_reason'] ?? null
            ]);
            exit;
        }

        // Return successful login response with approval status
        // Frontend will handle routing based on approval_status
        $token = generateToken($user['id']);
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'is_email_verified' => (bool)$user['is_email_verified'],
                'approval_status' => $approvalStatus,
                'rejection_reason' => $user['rejection_reason'] ?? null,
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ],
            'tokens' => [
                'accessToken' => $token,
                'refreshToken' => $token,
                'expiresIn' => 3600
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Login failed: ' . $e->getMessage()]);
}
?>
