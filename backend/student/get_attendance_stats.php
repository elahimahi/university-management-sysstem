<?php
/**
 * Get attendance statistics and history for a student
 * GET /student/attendance-stats?course_id=1
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;
$course_id = $data['course_id'] ?? null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    // Get statistics per course for the student
    $query = '
        SELECT 
            e.id as enrollment_id,
            c.id as course_id,
            c.name as course_name,
            c.code as course_code,
            COUNT(a.id) as total_classes,
            SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN a.status = \'absent\' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN a.status = \'late\' THEN 1 ELSE 0 END) as late,
            CASE 
                WHEN COUNT(a.id) = 0 THEN 0
                ELSE ROUND(
                    (CAST(SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) AS FLOAT) * 100.0 / CAST(COUNT(a.id) AS FLOAT)), 
                    2
                )
            END as attendance_percentage
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN attendance a ON e.id = a.enrollment_id
        WHERE e.student_id = ?
    ';
    
    $params = [$student_id];
    
    if ($course_id) {
        $query .= ' AND c.id = ?';
        $params[] = $course_id;
    }
    
    $query .= ' GROUP BY e.id, c.id, c.name, c.code';
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $stats = $stmt->fetchAll();

    // Get recent attendance records (TOP 30 for SQL Server)
    $recent_stmt = $pdo->prepare('
        SELECT TOP 30
            a.date,
            a.status,
            c.name as course_name,
            c.code as course_code
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY a.date DESC
    ');
    $recent_stmt->execute([$student_id]);
    $recent = $recent_stmt->fetchAll();

    http_response_code(200);
    
    // Calculate overall statistics
    $totalClasses = 0;
    $totalPresent = 0;
    $totalAbsent = 0;
    $totalLate = 0;
    
    foreach ($stats as $stat) {
        $totalClasses += (int)$stat['total_classes'];
        $totalPresent += (int)$stat['present'];
        $totalAbsent += (int)$stat['absent'];
        $totalLate += (int)$stat['late'];
    }
    
    $overallPercentage = $totalClasses > 0 
        ? round(($totalPresent / $totalClasses) * 100, 2)
        : 0;
    
    echo json_encode([
        'success' => true,
        'overall_statistics' => [
            'total_classes' => $totalClasses,
            'present' => $totalPresent,
            'absent' => $totalAbsent,
            'late' => $totalLate,
            'overall_percentage' => $overallPercentage
        ],
        'statistics' => $stats,
        'recent_records' => $recent
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
