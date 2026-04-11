<?php
// ============================================
// CORS HEADERS - FIRST
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(['ok' => true]));
}

// ============================================
// SETUP
// ============================================
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$logFile = __DIR__ . '/../../delete_user.log';

function debugLog($msg) {
    global $logFile;
    $time = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$time] $msg\n", FILE_APPEND);
}

debugLog("=== DELETE USER REQUEST STARTED ===");
debugLog("Method: " . $_SERVER['REQUEST_METHOD']);
debugLog("User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'));

try {
    // Load database and auth
    require_once __DIR__ . '/../core/db_connect.php';
    require_once __DIR__ . '/../auth/auth_helper.php';
    
    debugLog("DB and Auth loaded");

    // Get authenticated user
    $user = getAuthenticatedUser();
    if (!$user) {
        debugLog("Auth failed - user not authenticated");
        http_response_code(401);
        exit(json_encode(['status' => 'error', 'message' => 'Authentication required']));
    }
    
    debugLog("User authenticated: ID=" . $user['id'] . ", Role=" . $user['role']);

    // Check permissions
    $userRole = strtolower($user['role'] ?? '');
    if ($userRole !== 'admin' && $userRole !== 'superadmin') {
        debugLog("Permission denied: User role is $userRole");
        http_response_code(403);
        exit(json_encode(['status' => 'error', 'message' => 'Admin access required']));
    }

    // Get request body
    $rawInput = file_get_contents("php://input");
    debugLog("Raw input: " . substr($rawInput, 0, 100));
    
    $data = json_decode($rawInput, true);
    if (!is_array($data)) {
        debugLog("Invalid JSON");
        http_response_code(400);
        exit(json_encode(['status' => 'error', 'message' => 'Invalid request body']));
    }

    if (!isset($data['user_id'])) {
        debugLog("Missing user_id");
        http_response_code(400);
        exit(json_encode(['status' => 'error', 'message' => 'user_id required']));
    }

    $userId = (int)$data['user_id'];
    debugLog("Attempting to delete user ID: $userId");

    // Verify user exists
    try {
        $checkStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        if (!$checkStmt) {
            throw new Exception("Prepare failed for SELECT users");
        }
        $checkStmt->execute([$userId]);
        $targetUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$targetUser) {
            debugLog("Target user $userId not found");
            http_response_code(404);
            exit(json_encode(['status' => 'error', 'message' => 'User not found']));
        }
        
        debugLog("Target user found: role=" . $targetUser['role']);
    } catch (Exception $e) {
        debugLog("User lookup failed: " . $e->getMessage());
        http_response_code(500);
        exit(json_encode(['status' => 'error', 'message' => 'Database error']));
    }

    // Permission checks
    $targetRole = strtolower($targetUser['role'] ?? '');
    
    if ($targetRole === 'superadmin') {
        debugLog("Cannot delete superadmin");
        http_response_code(403);
        exit(json_encode(['status' => 'error', 'message' => 'Cannot delete superadmin']));
    }

    if ($userRole === 'admin' && $targetRole === 'admin') {
        debugLog("Admin cannot delete another admin");
        http_response_code(403);
        exit(json_encode(['status' => 'error', 'message' => 'Admins cannot delete admins']));
    }

    // Delete dependencies in proper order (respecting FK constraints)
    debugLog("Starting deletion cascade");
    
    // Tables that depend on fees (delete these first)
    $dependsOnFees = [
        'admin_notifications' => 'fee_id',
        'payment_transactions' => 'fee_id',
    ];

    foreach ($dependsOnFees as $table => $column) {
        try {
            // First get all fee_ids for this student
            $feeStmt = $pdo->prepare("SELECT id FROM fees WHERE student_id = ?");
            $feeStmt->execute([$userId]);
            $fees = $feeStmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($fees)) {
                $placeholders = implode(',', array_fill(0, count($fees), '?'));
                $sql = "DELETE FROM $table WHERE $column IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($fees);
                $count = $stmt->rowCount();
                debugLog("Deleted $count rows from $table");
            }
        } catch (Throwable $e) {
            debugLog("Table $table delete error (ignored): " . $e->getMessage());
        }
    }

    // Student-related tables (delete after FK dependencies)
    $studentTables = [
        'fees' => 'student_id',
        'grades' => 'student_id',
        'enrollments' => 'student_id',
        'submissions' => 'student_id',
        'attendance' => 'student_id',
        'assignment_submissions' => 'student_id',
        'payment_transactions' => 'student_id',
    ];

    foreach ($studentTables as $table => $column) {
        try {
            $sql = "DELETE FROM $table WHERE $column = ?";
            $stmt = $pdo->prepare($sql);
            if ($stmt) {
                $stmt->execute([$userId]);
                $count = $stmt->rowCount();
                debugLog("Deleted $count rows from $table");
            }
        } catch (Throwable $e) {
            debugLog("Table $table delete error (ignored): " . $e->getMessage());
        }
    }

    // Delete from course_assignments where user created them
    try {
        $stmt = $pdo->prepare("DELETE FROM course_assignments WHERE created_by = ?");
        if ($stmt) {
            $stmt->execute([$userId]);
            $count = $stmt->rowCount();
            debugLog("Deleted $count rows from course_assignments");
        }
    } catch (Throwable $e) {
        debugLog("Course assignments delete error (ignored): " . $e->getMessage());
    }

    // Delete from notifications table (references user as recipient or actor)
    try {
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE recipient_id = ? OR actor_id = ?");
        if ($stmt) {
            $stmt->execute([$userId, $userId]);
            $count = $stmt->rowCount();
            debugLog("Deleted $count rows from notifications");
        }
    } catch (Throwable $e) {
        debugLog("Notifications delete error (ignored): " . $e->getMessage());
    }

    // Update references
    try {
        $stmt = $pdo->prepare("UPDATE courses SET instructor_id = NULL WHERE instructor_id = ?");
        if ($stmt) {
            $stmt->execute([$userId]);
            debugLog("Updated courses table");
        }
    } catch (Throwable $e) {
        debugLog("Courses update error: " . $e->getMessage());
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET approved_by = NULL WHERE approved_by = ?");
        if ($stmt) {
            $stmt->execute([$userId]);
            debugLog("Updated users.approved_by");
        }
    } catch (Throwable $e) {
        debugLog("Users update error: " . $e->getMessage());
    }

    // Delete the user
    try {
        $delStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        if (!$delStmt) {
            throw new Exception("Prepare failed");
        }
        if (!$delStmt->execute([$userId])) {
            throw new Exception("Execute failed");
        }
        debugLog("User $userId deleted successfully");
    } catch (Throwable $e) {
        debugLog("Final user delete failed: " . $e->getMessage());
        http_response_code(500);
        exit(json_encode(['status' => 'error', 'message' => 'Failed to delete user']));
    }

    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'User deleted']);
    debugLog("=== DELETE SUCCESS ===");

} catch (Throwable $e) {
    debugLog("CRITICAL ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
?>
