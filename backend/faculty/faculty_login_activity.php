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
$facultyId = verifyToken($token);

if (!$facultyId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

try {
    // Get faculty role
    $userStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $userStmt->execute([$facultyId]);
    $user = $userStmt->fetch();

    if ($user['role'] !== 'faculty') {
        http_response_code(403);
        echo json_encode(['message' => 'Only faculty can view student login activity']);
        exit;
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
            CAST(SUM(CASE WHEN CAST(lh.login_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as INT) as today_logins
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        JOIN login_history lh ON u.id = lh.user_id
        WHERE c.instructor_id = ? AND e.status = 'active'
        GROUP BY u.id, u.first_name, u.last_name, u.email, c.name, c.id
        ORDER BY MAX(lh.login_at) DESC
    ");
    $stmt->execute([$facultyId]);
    $loginActivity = $stmt->fetchAll();

    // Also get students without login history
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
        WHERE c.instructor_id = ? AND e.status = 'active'
        AND u.id NOT IN (SELECT DISTINCT user_id FROM login_history)
        ORDER BY u.last_name, u.first_name
    ");
    $noLoginStmt->execute([$facultyId]);
    $noLoginStudents = $noLoginStmt->fetchAll();

    // Combine both results
    $allActivity = array_merge($loginActivity, $noLoginStudents);

    echo json_encode([
        'success' => true,
        'activity' => $allActivity,
        'total_students' => count($allActivity)
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
