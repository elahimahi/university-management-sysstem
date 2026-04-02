<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $total = 0;
    $students = 0;
    $faculty = 0;
    
    // Get total users count
    $totalStmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    if ($totalStmt) {
        $totalResult = $totalStmt->fetch();
        if ($totalResult && isset($totalResult['total'])) {
            $total = (int)$totalResult['total'];
        }
    }
    
    // Get students count
    $studentsStmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    if ($studentsStmt) {
        $studentsResult = $studentsStmt->fetch();
        if ($studentsResult && isset($studentsResult['count'])) {
            $students = (int)$studentsResult['count'];
        }
    }
    
    // Get faculty count
    $facultyStmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty'");
    if ($facultyStmt) {
        $facultyResult = $facultyStmt->fetch();
        if ($facultyResult && isset($facultyResult['count'])) {
            $faculty = (int)$facultyResult['count'];
        }
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'total' => $total,
        'students' => $students,
        'faculty' => $faculty,
        'admins' => ($total - $students - $faculty),
        'totalUsers' => $total,
        'totalStudents' => $students,
        'totalFaculty' => $faculty
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage(),
        'success' => false
    ]);
}
?>
