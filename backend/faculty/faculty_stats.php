<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireFacultyAuth();
$facultyId = $user['id'];

try {
    // 1. Get total courses
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE instructor_id = ?");
    $stmt->execute([$facultyId]);
    $totalCourses = $stmt->fetchColumn();

    // 2. Get total students (unique students enrolled in courses taught by this instructor)
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT e.student_id) 
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
    ");
    $stmt->execute([$facultyId]);
    $totalStudents = $stmt->fetchColumn();

    // 3. Get courses list with student count per course
    $stmt = $pdo->prepare("
        SELECT c.id, c.code, c.name, COUNT(e.id) as student_count
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.instructor_id = ?
        GROUP BY c.id, c.code, c.name
    ");
    $stmt->execute([$facultyId]);
    $courses = $stmt->fetchAll();

    // 4. Calculate Attendance Rate for this faculty's students and breakdown
    $attendanceRate = 0;
    $attendanceBreakdown = [
        'presentPercent' => 0,
        'latePercent' => 0,
        'absentPercent' => 0,
        'total' => 0,
    ];

    try {
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as totalRecords,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
                AVG(CASE 
                    WHEN a.status = 'present' THEN 1.0
                    WHEN a.status = 'late' THEN 0.5
                    WHEN a.status = 'absent' THEN 0.0
                    ELSE 0.0
                END) as avgAttendanceRate
            FROM attendance a
            JOIN enrollments e ON a.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = ? AND a.status IS NOT NULL
        ");
        $stmt->execute([$facultyId]);
        $attendanceData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($attendanceData) {
            $attendanceRate = $attendanceData['avgAttendanceRate'] ? floatval($attendanceData['avgAttendanceRate']) * 100 : 0;
            $totalRecords = intval($attendanceData['totalRecords'] ?? 0);
            $presentPercent = $totalRecords > 0 ? round((intval($attendanceData['presentCount'] ?? 0) / $totalRecords) * 100, 1) : 0;
            $latePercent = $totalRecords > 0 ? round((intval($attendanceData['lateCount'] ?? 0) / $totalRecords) * 100, 1) : 0;
            $absentPercent = $totalRecords > 0 ? round((intval($attendanceData['absentCount'] ?? 0) / $totalRecords) * 100, 1) : 0;

            $attendanceBreakdown = [
                'presentPercent' => $presentPercent,
                'latePercent' => $latePercent,
                'absentPercent' => $absentPercent,
                'total' => $totalRecords,
            ];
        }
    } catch (PDOException $e) {
        // Use default if query fails
    }

    // 5. Get recent activity from database
    // Enrollments
    $enrolActivity = [];
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 2 'enrollment' as type, CONCAT(u.first_name, ' enrolled in ', c.name) as message, e.enrolled_at as time
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = ?
            ORDER BY e.enrolled_at DESC
        ");
        $stmt->execute([$facultyId]);
        $enrolActivity = $stmt->fetchAll();
    } catch (PDOException $e) {
        $enrolActivity = [];
    }

    // Grades
    $gradeActivity = [];
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 2 'grade' as type, CONCAT(u.first_name, ' received grade in ', c.name) as message, g.recorded_at as time
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id = ?
            ORDER BY g.recorded_at DESC
        ");
        $stmt->execute([$facultyId]);
        $gradeActivity = $stmt->fetchAll();
    } catch (PDOException $e) {
        $gradeActivity = [];
    }

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

    // Get pending grades based on active enrollments that do not yet have grade records
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as pendingGrades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
          AND e.status = 'active'
          AND NOT EXISTS (
              SELECT 1 FROM grades g
              WHERE g.student_id = e.student_id
                AND g.course_id = e.course_id
                AND g.semester = e.semester
          )
    ");
    $stmt->execute([$facultyId]);
    $pendingGradesData = $stmt->fetch(PDO::FETCH_ASSOC);
    $pendingGradesCount = intval($pendingGradesData['pendingGrades'] ?? 0);

    // Get submitted grades count - count all grades in enrollments for courses taught by this faculty
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as submittedGrades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ?
          AND EXISTS (
              SELECT 1 FROM grades g
              WHERE g.student_id = e.student_id
                AND g.course_id = e.course_id
                AND g.semester = e.semester
          )
    ");
    $stmt->execute([$facultyId]);
    $submittedGradesData = $stmt->fetch(PDO::FETCH_ASSOC);
    $submittedGradesCount = intval($submittedGradesData['submittedGrades'] ?? 0);

    echo json_encode([
        'stats' => [
            'totalCourses' => (int)$totalCourses,
            'totalStudents' => (int)$totalStudents,
            'attendanceRate' => round((float)$attendanceRate),
            'pendingGrades' => $pendingGradesCount,
            'totalGradesSubmitted' => $submittedGradesCount,
            'attendanceBreakdown' => $attendanceBreakdown,
        ],
        'courses' => $courses,
        'recentActivity' => array_slice($recentActivity, 0, 4)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch faculty stats: ' . $e->getMessage()]);
}
?>
