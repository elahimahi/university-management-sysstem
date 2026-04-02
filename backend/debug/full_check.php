<?php
/**
 * Comprehensive Debug Endpoint
 * GET /debug/full-check
 * 
 * Checks everything: database, auth, courses, demo data
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

header('Content-Type: application/json');

$debug = [];

// 1. Check database connection
try {
    $stmt = $pdo->query("SELECT 1");
    $debug['database'] = ['status' => 'ok', 'message' => 'Database connected'];
} catch (Exception $e) {
    $debug['database'] = ['status' => 'error', 'message' => $e->getMessage()];
}

// 2. Check users table
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    $debug['users_count'] = $result['count'] ?? 0;
} catch (Exception $e) {
    $debug['users_count'] = 'error: ' . $e->getMessage();
}

// 3. Check courses table
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM courses");
    $result = $stmt->fetch();
    $debug['courses_count'] = $result['count'] ?? 0;
} catch (Exception $e) {
    $debug['courses_count'] = 'error: ' . $e->getMessage();
}

// 4. Check faculty users
try {
    $stmt = $pdo->query("SELECT id, email, first_name, last_name, role FROM users WHERE role = 'faculty'");
    $faculties = $stmt->fetchAll();
    $debug['faculty_users'] = $faculties;
} catch (Exception $e) {
    $debug['faculty_users'] = 'error: ' . $e->getMessage();
}

// 5. Check courses by faculty
try {
    $stmt = $pdo->query("SELECT c.id, c.code, c.name, c.instructor_id, u.email FROM courses c LEFT JOIN users u ON c.instructor_id = u.id");
    $courses = $stmt->fetchAll();
    $debug['courses_list'] = $courses;
} catch (Exception $e) {
    $debug['courses_list'] = 'error: ' . $e->getMessage();
}

// 6. Check authentication
$user = getAuthenticatedUser();
if ($user) {
    $debug['authenticated_user'] = $user;
} else {
    $debug['authenticated_user'] = 'not authenticated';
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
