<?php
// CORS Headers - MUST be first
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization', true);
header('Access-Control-Max-Age: 3600', true);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated and is faculty
$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized - Please login first', 'status' => 'error']);
    exit();
}

if ($user['role'] !== 'faculty') {
    http_response_code(403);
    echo json_encode(['message' => 'Forbidden - Only faculty can view login activity', 'status' => 'error']);
    exit();
}

try {
    $facultyId = $user['id'];
    
    // Check if login_history table exists
    $tableCheckStmt = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'login_history'");
    $tableExists = $tableCheckStmt->fetch();
    
    if (!$tableExists) {
        // Return empty activity if table doesn't exist
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'activity' => [],
            'total_students' => 0,
            'message' => 'Login history tracking is not enabled'
        ]);
        exit();
    }
    
    // Get login activity for students in instructor's courses
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            c.name as course_name,
            c.id as course_id,
            COUNT(lh.id) as login_count,
            MAX(lh.login_at) as last_login,
            MIN(lh.login_at) as first_login,
            ISNULL(SUM(CASE WHEN CAST(lh.login_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END), 0) as today_logins
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN login_history lh ON u.id = lh.user_id
        WHERE c.instructor_id = ? AND e.status = 'active'
        GROUP BY u.id, u.first_name, u.last_name, u.email, c.name, c.id
        ORDER BY MAX(lh.login_at) DESC
    ");
    $stmt->execute([$facultyId]);
    $loginActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Also get students without any login history
    $noLoginStmt = $pdo->prepare("
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            c.name as course_name,
            c.id as course_id,
            0 as login_count,
            NULL as last_login,
            NULL as first_login,
            0 as today_logins
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? 
        AND e.status = 'active'
        AND u.id NOT IN (SELECT DISTINCT user_id FROM login_history WHERE user_id IS NOT NULL)
        ORDER BY u.last_name, u.first_name
    ");
    $noLoginStmt->execute([$facultyId]);
    $noLoginStudents = $noLoginStmt->fetchAll(PDO::FETCH_ASSOC);

    // Combine both results
    $allActivity = array_merge($loginActivity, $noLoginStudents);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'activity' => $allActivity,
        'total_students' => count($allActivity),
        'status' => 'success'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('Faculty login activity error: ' . $e->getMessage());
    echo json_encode([
        'message' => 'Database error occurred',
        'status' => 'error',
        'error_details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Faculty login activity general error: ' . $e->getMessage());
    echo json_encode([
        'message' => 'Server error occurred',
        'status' => 'error',
        'error_details' => $e->getMessage()
    ]);
}
?>
