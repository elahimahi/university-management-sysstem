<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$userId = verifyToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid or expired token']);
    exit;
}

try {
    // 1. Get total courses
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE instructor_id = ?");
    $stmt->execute([$userId]);
    $totalCourses = $stmt->fetchColumn();

    // 2. Get total students (unique students enrolled in courses taught by this instructor)
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT e.student_id) 
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
    ");
    $stmt->execute([$userId]);
    $totalStudents = $stmt->fetchColumn();

    // 3. Get courses list with student count per course
    $stmt = $pdo->prepare("
        SELECT c.id, c.code, c.name, COUNT(e.id) as student_count
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.instructor_id = ?
        GROUP BY c.id, c.code, c.name
    ");
    $stmt->execute([$userId]);
    $courses = $stmt->fetchAll();

    // 4. Calculate Attendance Rate for this faculty's students
    $stmt = $pdo->prepare("
        SELECT 
            CASE 
                WHEN COUNT(a.id) = 0 THEN 0
                ELSE CAST(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id) AS FLOAT)
            END as rate
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
    ");
    $stmt->execute([$userId]);
    $attendanceRate = $stmt->fetchColumn() ?: 0;

    // 5. Get recent activity from database
    // Enrollments
    $stmt = $pdo->prepare("
        SELECT TOP 2 'enrollment' as type, CONCAT(u.first_name, ' enrolled in ', c.name) as message, e.enrolled_at as time
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
        ORDER BY e.enrolled_at DESC
    ");
    $stmt->execute([$userId]);
    $enrolActivity = $stmt->fetchAll();

    // Grades
    $stmt = $pdo->prepare("
        SELECT TOP 2 'grade' as type, CONCAT(u.first_name, ' graded in ', c.name) as message, g.recorded_at as time
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
        ORDER BY g.recorded_at DESC
    ");
    $stmt->execute([$userId]);
    $gradeActivity = $stmt->fetchAll();

    $recentActivity = array_merge($enrolActivity, $gradeActivity);
    usort($recentActivity, function($a, $b) {
        return strtotime($b['time']) - strtotime($a['time']);
    });

    // Format relative time
    foreach($recentActivity as &$act) {
        $diff = time() - strtotime($act['time']);
        if ($diff < 60) $act['time'] = 'Just now';
        elseif ($diff < 3600) $act['time'] = floor($diff/60) . ' mins ago';
        elseif ($diff < 86400) $act['time'] = floor($diff/3600) . ' hours ago';
        else $act['time'] = floor($diff/86400) . ' days ago';
    }

    echo json_encode([
        'stats' => [
            'totalCourses' => (int)$totalCourses,
            'totalStudents' => (int)$totalStudents,
            'attendanceRate' => round((float)$attendanceRate),
            'pendingGrades' => rand(5, 15) // Still mocked as 'pending' isn't explicitly tracked yet
        ],
        'courses' => $courses,
        'recentActivity' => array_slice($recentActivity, 0, 4)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch faculty stats: ' . $e->getMessage()]);
}
?>
