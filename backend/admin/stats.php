<?php
/**
 * Admin Dashboard Statistics API
 * Provides real-time system and admin statistics
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $stats = [
        'total_users' => 0,
        'active_sessions' => 0,
        'total_revenue' => 0,
        'system_health' => 95,
        'students' => 0,
        'faculty' => 0,
        'admins' => 0,
        'courses' => 0,
        'enrollments' => 0,
        'pending_fees' => 0,
        'timestamp' => date('Y-m-d H:i:s'),
    ];

    // Get total users by role
    $userQuery = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
    $userStmt = $pdo->query($userQuery);
    $userCounts = $userStmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    $stats['students'] = $userCounts['student'] ?? 0;
    $stats['faculty'] = $userCounts['faculty'] ?? 0;
    $stats['admins'] = $userCounts['admin'] ?? 0;
    $stats['total_users'] = array_sum($userCounts);

    // Get course count
    $courseQuery = "SELECT COUNT(*) as count FROM courses";
    $stats['courses'] = $pdo->query($courseQuery)->fetch()['count'] ?? 0;

    // Get enrollment count
    $enrollmentQuery = "SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'";
    $stats['enrollments'] = $pdo->query($enrollmentQuery)->fetch()['count'] ?? 0;

    // Calculate revenue from payments
    $revenueQuery = "SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments WHERE status = 'completed'";
    $stats['total_revenue'] = (float)$pdo->query($revenueQuery)->fetch()['total'] ?? 0;

    // Count pending fees
    $feesQuery = "SELECT COUNT(*) as count FROM fees WHERE status = 'pending'";
    $stats['pending_fees'] = $pdo->query($feesQuery)->fetch()['count'] ?? 0;

    // Calculate active sessions (logins within last hour)
    $sessionQuery = "SELECT COUNT(DISTINCT user_id) as count FROM login_history 
                     WHERE login_time >= DATEADD(HOUR, -1, GETDATE()) 
                     AND (logout_time IS NULL OR logout_time >= DATEADD(HOUR, -1, GETDATE()))";
    $stats['active_sessions'] = $pdo->query($sessionQuery)->fetch()['count'] ?? 0;

    // System health calculation
    // Check database connectivity (100 points)
    $health = 100;
    
    // Check pending issues
    if ($stats['pending_fees'] > 50) $health -= 5;
    if ($stats['enrollments'] > 1000) $health -= 2; // High load
    if ($stats['active_sessions'] > 200) $health -= 3; // High concurrent users
    
    $stats['system_health'] = max(70, min(100, $health));

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $stats
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch statistics',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
