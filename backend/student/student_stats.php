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
    // 1. Basic Stats
    // GPA (Mocked calculation for now, based on average of grade_point)
    $stmt = $pdo->prepare("SELECT AVG(g.grade_point) FROM grades g JOIN enrollments e ON g.enrollment_id = e.id WHERE e.student_id = ?");
    $stmt->execute([$userId]);
    $gpa = $stmt->fetchColumn() ?: 0.0;

    // Total Credits (completed courses)
    $stmt = $pdo->prepare("
        SELECT SUM(c.credits) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = ? AND e.status = 'completed'
    ");
    $stmt->execute([$userId]);
    $completedCredits = $stmt->fetchColumn() ?: 0;

    // Credits in Progress (active courses)
    $stmt = $pdo->prepare("
        SELECT SUM(c.credits) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = ? AND e.status = 'active'
    ");
    $stmt->execute([$userId]);
    $inProgressCredits = $stmt->fetchColumn() ?: 0;

    $totalCredits = $completedCredits + $inProgressCredits;

    // Attendance Rate
    $stmt = $pdo->prepare("
        SELECT 
            (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        WHERE e.student_id = ?
    ");
    $stmt->execute([$userId]);
    $attendanceRate = $stmt->fetchColumn() ?: 0;

    // 2. Current Semester Courses (both active and completed) with grades
    $stmt = $pdo->prepare("
        SELECT 
            c.id, 
            c.code, 
            c.name as title, 
            u.last_name as instructor, 
            c.credits, 
            e.status,
            MAX(g.grade) as latest_grade,
            MAX(g.grade_point) as latest_grade_point,
            AVG(CAST(g.grade_point as FLOAT)) as avg_grade_point,
            COUNT(g.id) as total_grades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN grades g ON e.id = g.enrollment_id
        WHERE e.student_id = ? AND e.status IN ('active', 'completed')
        GROUP BY c.id, c.code, c.name, u.last_name, c.credits, e.status
        ORDER BY e.status DESC, c.code
    ");
    $stmt->execute([$userId]);
    $currentCourses = $stmt->fetchAll();

    // 3. Recent Grades
    $stmt = $pdo->prepare("
        SELECT TOP 4 c.name as subject, g.grade, g.recorded_at as time
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY g.recorded_at DESC
    ");
    $stmt->execute([$userId]);
    $recentGrades = $stmt->fetchAll();

    // 4. Attendance Trends (last 5 days)
    $stmt = $pdo->prepare("
        SELECT TOP 5 FORMAT(a.date, 'ddd') as name, COUNT(CASE WHEN a.status = 'present' THEN 1 END) as value
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        WHERE e.student_id = ?
        GROUP BY a.date
        ORDER BY a.date DESC
    ");
    $stmt->execute([$userId]);
    $attendanceTrends = array_reverse($stmt->fetchAll());

    // 5. Fees and Payments
    $stmt = $pdo->prepare("SELECT description as label, amount FROM fees WHERE student_id = ? AND status != 'paid'");
    $stmt->execute([$userId]);
    $pendingFees = $stmt->fetchAll();

    $stmt = $pdo->prepare("SELECT TOP 3 p.id, FORMAT(p.payment_date, 'MMM dd') as date, p.amount_paid as amount, p.payment_method as method, 'Paid' as status FROM payments p JOIN fees f ON p.fee_id = f.id WHERE f.student_id = ? ORDER BY p.payment_date DESC");
    $stmt->execute([$userId]);
    $paymentHistory = $stmt->fetchAll();

    echo json_encode([
        'stats' => [
            'gpa' => number_format((float)$gpa, 2),
            'credits' => (int)$totalCredits,
            'completedCredits' => (int)$completedCredits,
            'inProgressCredits' => (int)$inProgressCredits,
            'creditsRemaining' => max(0, 140 - (int)$completedCredits),
            'attendance' => round((float)$attendanceRate) . '%'
        ],
        'currentCourses' => $currentCourses,
        'recentGrades' => $recentGrades,
        'attendanceTrends' => $attendanceTrends,
        'fees' => [
            'structure' => $pendingFees,
            'history' => $paymentHistory
        ],
        'deadlines' => [ // Mocked
            ['date' => 'Feb 25', 'title' => 'Database Lab 3', 'type' => 'Lab'],
            ['date' => 'Mar 02', 'title' => 'ML Midterm', 'type' => 'Exam']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch student stats: ' . $e->getMessage()]);
}
?>
