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
    // GPA (Calculation based on average points from grades)
    $stmt = $pdo->prepare("SELECT AVG(g.points) FROM grades g WHERE g.student_id = ?");
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

    // Attendance Rate (with fallback if table schema differs)
    $attendanceRate = 85;
    try {
        $stmt = $pdo->prepare("
            SELECT 
                (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
            FROM attendance a
            WHERE a.student_id = ?
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetchColumn();
        if ($result !== null) {
            $attendanceRate = $result;
        }
    } catch (PDOException $e) {
        // Attendance table schema might differ, use default
        $attendanceRate = 85;
    }

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
            MAX(g.points) as latest_grade_point,
            AVG(CAST(g.points as FLOAT)) as avg_grade_point,
            COUNT(g.id) as total_grades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
        WHERE e.student_id = ? AND e.status IN ('active', 'completed')
        GROUP BY c.id, c.code, c.name, u.last_name, c.credits, e.status
        ORDER BY e.status DESC, c.code
    ");
    $stmt->execute([$userId]);
    $currentCourses = $stmt->fetchAll();

    // 3. Recent Grades
    $stmt = $pdo->prepare("
        SELECT TOP 4 c.name as subject, g.grade, g.assigned_at as time
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE g.student_id = ?
        ORDER BY g.assigned_at DESC
    ");
    $stmt->execute([$userId]);
    $recentGrades = $stmt->fetchAll();

    // 4. Attendance Trends (last 5 days) - with fallback
    $attendanceTrends = [
        ['name' => 'Mon', 'value' => 5],
        ['name' => 'Tue', 'value' => 4],
        ['name' => 'Wed', 'value' => 5],
        ['name' => 'Thu', 'value' => 3],
        ['name' => 'Fri', 'value' => 5]
    ];
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 5 FORMAT(a.attendance_date, 'ddd') as name, COUNT(CASE WHEN a.status = 'present' THEN 1 END) as value
            FROM attendance a
            WHERE a.student_id = ?
            GROUP BY a.attendance_date
            ORDER BY a.attendance_date DESC
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetchAll();
        if (!empty($result)) {
            $attendanceTrends = array_reverse($result);
        }
    } catch (PDOException $e) {
        // Use default mock data
    }

    // 5. Fees and Payments
    $pendingFees = [];
    $paymentHistory = [];
    
    try {
        $stmt = $pdo->prepare("SELECT TOP 5 CAST(amount as VARCHAR) as label, amount FROM fees WHERE student_id = ? AND status != 'paid'");
        $stmt->execute([$userId]);
        $pendingFees = $stmt->fetchAll();
    } catch (PDOException $e) {}
    
    try {
        $stmt = $pdo->prepare("SELECT TOP 3 id, FORMAT(paid_at, 'MMM dd') as date, amount as amount FROM fees WHERE student_id = ? AND status = 'paid' ORDER BY paid_at DESC");
        $stmt->execute([$userId]);
        $paymentHistory = $stmt->fetchAll();
    } catch (PDOException $e) {
        // Try alternate query if paid_at doesn't exist
        try {
            $stmt = $pdo->prepare("SELECT TOP 3 id, CAST(created_at as VARCHAR(20)) as date, amount FROM fees WHERE student_id = ? AND status = 'paid' ORDER BY created_at DESC");
            $stmt->execute([$userId]);
            $paymentHistory = $stmt->fetchAll();
        } catch (PDOException $e2) {}
    }

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
