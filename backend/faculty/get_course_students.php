<?php
/**
 * Get all students enrolled in a faculty's course with their current attendance
 * GET /faculty/course-students?course_id=1&date=2024-03-17
 */

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$course_id = $_GET['course_id'] ?? null;
$faculty_id = $_GET['faculty_id'] ?? null;
$date = $_GET['date'] ?? date('Y-m-d');
$semester = $_GET['semester'] ?? null;

if (!$course_id || !$faculty_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters: course_id, faculty_id']);
    exit;
}

try {
    // Verify faculty is the instructor of this course
    $verify_stmt = $pdo->prepare('SELECT id, name FROM courses WHERE id = ? AND instructor_id = ?');
    $verify_stmt->execute([$course_id, $faculty_id]);
    $course = $verify_stmt->fetch();
    
    if (!$course) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: You are not the instructor for this course']);
        exit;
    }

    // Get all students enrolled in this course
    $query = '
        SELECT 
            e.id as enrollment_id,
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email,
            e.semester,
            a.status as attendance_status,
            a.date as attendance_date
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        LEFT JOIN attendance a ON e.id = a.enrollment_id AND CAST(a.date AS DATE) = CAST(? AS DATE)
        WHERE e.course_id = ? AND e.status = ?
    ';
    
    $params = [$date, $course_id, 'active'];
    
    if ($semester) {
        $query .= ' AND e.semester = ?';
        $params[] = $semester;
    }
    
    $query .= ' ORDER BY u.last_name, u.first_name';
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $students = $stmt->fetchAll();

    // Get course statistics
    $stats_stmt = $pdo->prepare('
        SELECT 
            COUNT(DISTINCT e.id) as total_students,
            SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) as present_count,
            SUM(CASE WHEN a.status = \'absent\' THEN 1 ELSE 0 END) as absent_count,
            SUM(CASE WHEN a.status = \'late\' THEN 1 ELSE 0 END) as late_count
        FROM enrollments e
        LEFT JOIN attendance a ON e.id = a.enrollment_id AND CAST(a.date AS DATE) = CAST(? AS DATE)
        WHERE e.course_id = ? AND e.status = ?
    ');
    $stats_stmt->execute([$date, $course_id, 'active']);
    $stats = $stats_stmt->fetch();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'course' => $course,
        'date' => $date,
        'students' => $students,
        'statistics' => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
