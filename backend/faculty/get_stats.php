<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

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

    // Get pending grades (students who have completed but grade not submitted)
    $pendingQuery = "
        SELECT COUNT(*) as pendingGrades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.status = 'active' AND e.grade IS NULL
    ";
    $pendingStmt = $pdo->prepare($pendingQuery);
    $pendingStmt->execute([$faculty_id]);
    $pendingData = $pendingStmt->fetch(PDO::FETCH_ASSOC);

    // Get submitted grades count
    $submittedQuery = "
        SELECT COUNT(*) as submittedGrades
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.grade IS NOT NULL
    ";
    $submittedStmt = $pdo->prepare($submittedQuery);
    $submittedStmt->execute([$faculty_id]);
    $submittedData = $submittedStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalCourses' => intval($courseData['totalCourses'] ?? 0),
            'totalStudents' => intval($studentData['totalStudents'] ?? 0),
            'pendingGrades' => intval($pendingData['pendingGrades'] ?? 0),
            'totalGradesSubmitted' => intval($submittedData['submittedGrades'] ?? 0)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
