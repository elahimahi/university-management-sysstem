<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';

try {
    $faculty_id = $_GET['faculty_id'] ?? null;

    if (!$faculty_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Faculty ID is required']);
        exit;
    }

    // Get total courses taught by this faculty
    $courseQuery = "SELECT COUNT(*) as totalCourses FROM courses WHERE instructor_id = ?";
    $courseStmt = $pdo->prepare($courseQuery);
    $courseStmt->execute([$faculty_id]);
    $courseData = $courseStmt->fetch(PDO::FETCH_ASSOC);

    // Get total students in all courses taught by this faculty
    $studentQuery = "
        SELECT COUNT(DISTINCT e.student_id) as totalStudents 
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.status = 'active'
    ";
    $studentStmt = $pdo->prepare($studentQuery);
    $studentStmt->execute([$faculty_id]);
    $studentData = $studentStmt->fetch(PDO::FETCH_ASSOC);

    // Get pending grades (active enrollments without grade records)
    $pendingQuery = "
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
    ";
    $pendingStmt = $pdo->prepare($pendingQuery);
    $pendingStmt->execute([$faculty_id]);
    $pendingData = $pendingStmt->fetch(PDO::FETCH_ASSOC);

    // Get submitted grades count for active enrollments with grade records
    $submittedQuery = "
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
    ";
    $submittedStmt = $pdo->prepare($submittedQuery);
    $submittedStmt->execute([$faculty_id]);
    $submittedData = $submittedStmt->fetch(PDO::FETCH_ASSOC);

    // Get average attendance rate with breakdown
    // Formula: Present = 1.0 (100%), Late = 0.5 (50%), Absent = 0 (0%)
    $attendanceQuery = "
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
    ";
    $attendanceStmt = $pdo->prepare($attendanceQuery);
    $attendanceStmt->execute([$faculty_id]);
    $attendanceData = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
    
    $attendanceRate = $attendanceData['avgAttendanceRate'] ? floatval($attendanceData['avgAttendanceRate']) * 100 : 0;
    
    // Calculate percentages for breakdown
    $totalRecords = intval($attendanceData['totalRecords'] ?? 0);
    $presentPercent = $totalRecords > 0 ? round((intval($attendanceData['presentCount'] ?? 0) / $totalRecords) * 100, 1) : 0;
    $latePercent = $totalRecords > 0 ? round((intval($attendanceData['lateCount'] ?? 0) / $totalRecords) * 100, 1) : 0;
    $absentPercent = $totalRecords > 0 ? round((intval($attendanceData['absentCount'] ?? 0) / $totalRecords) * 100, 1) : 0;

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalCourses' => intval($courseData['totalCourses'] ?? 0),
            'totalStudents' => intval($studentData['totalStudents'] ?? 0),
            'pendingGrades' => intval($pendingData['pendingGrades'] ?? 0),
            'totalGradesSubmitted' => intval($submittedData['submittedGrades'] ?? 0),
            'attendanceRate' => round($attendanceRate, 1),
            'attendanceBreakdown' => [
                'presentPercent' => $presentPercent,
                'latePercent' => $latePercent,
                'absentPercent' => $absentPercent,
                'total' => $totalRecords
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
