<?php
/**
 * Faculty Reports API
 * Provides submission and grading analytics for faculty
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $response = [
        'status' => 'success',
        'record_counts' => [
            'users' => 0,
            'courses' => 0,
            'enrollments' => 0,
            'course_assignments' => 0,
            'assignment_submissions' => 0,
        ],
        'assignments_summary' => [
            'submission_rate' => '0%',
            'average_grade' => 'N/A'
        ],
        'grading_summary' => [
            'pending_grading' => 0,
            'graded' => 0
        ],
        'submissions_detail' => []
    ];

    // Get user counts
    try {
        $userQuery = "SELECT COUNT(*) as total FROM users";
        $result = $pdo->query($userQuery);
        if ($result) {
            $data = $result->fetch();
            $response['record_counts']['users'] = (int)($data['total'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("User count query failed: " . $e->getMessage());
    }

    // Get course counts
    try {
        $courseQuery = "SELECT COUNT(*) as total FROM courses";
        $result = $pdo->query($courseQuery);
        if ($result) {
            $data = $result->fetch();
            $response['record_counts']['courses'] = (int)($data['total'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Course count query failed: " . $e->getMessage());
    }

    // Get enrollment counts
    try {
        $enrollmentQuery = "SELECT COUNT(*) as total FROM enrollments WHERE status = 'active'";
        $result = $pdo->query($enrollmentQuery);
        if ($result) {
            $data = $result->fetch();
            $response['record_counts']['enrollments'] = (int)($data['total'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Enrollment count query failed: " . $e->getMessage());
    }

    // Get course assignments
    try {
        $assignmentQuery = "SELECT COUNT(*) as total FROM course_assignments";
        $result = $pdo->query($assignmentQuery);
        if ($result) {
            $data = $result->fetch();
            $response['record_counts']['course_assignments'] = (int)($data['total'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Assignment count query failed: " . $e->getMessage());
    }

    // Get assignment submissions
    try {
        $submissionQuery = "SELECT COUNT(*) as total FROM assignment_submissions";
        $result = $pdo->query($submissionQuery);
        if ($result) {
            $data = $result->fetch();
            $response['record_counts']['assignment_submissions'] = (int)($data['total'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Submission count query failed: " . $e->getMessage());
    }

    // Get pending grading count
    try {
        $pendingQuery = "SELECT COUNT(*) as pending FROM assignment_submissions WHERE grade IS NULL OR grade = ''";
        $result = $pdo->query($pendingQuery);
        if ($result) {
            $data = $result->fetch();
            $response['grading_summary']['pending_grading'] = (int)($data['pending'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Pending count query failed: " . $e->getMessage());
    }

    // Get graded count
    try {
        $gradedQuery = "SELECT COUNT(*) as graded FROM assignment_submissions WHERE grade IS NOT NULL AND grade != ''";
        $result = $pdo->query($gradedQuery);
        if ($result) {
            $data = $result->fetch();
            $response['grading_summary']['graded'] = (int)($data['graded'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Graded count query failed: " . $e->getMessage());
    }

    // Calculate submission rate
    $totalAssignments = $response['record_counts']['course_assignments'];
    $totalSubmissions = $response['record_counts']['assignment_submissions'];
    if ($totalAssignments > 0) {
        $submissionRate = round(($totalSubmissions / $totalAssignments) * 100, 1);
        $response['assignments_summary']['submission_rate'] = $submissionRate . '%';
    }

    // Get detailed submissions with student names and course info
    try {
        $detailQuery = "
            SELECT 
                (u.first_name + ' ' + u.last_name) as student_name,
                ca.title as assignment_title,
                c.code as course_code,
                asub.submitted_at,
                CASE WHEN asub.grade IS NULL OR asub.grade = '' THEN 'pending' ELSE 'graded' END as feedback_status,
                ISNULL(asub.faculty_feedback, '') as feedback_notes
            FROM assignment_submissions asub
            JOIN course_assignments ca ON asub.assignment_id = ca.id
            JOIN courses c ON ca.course_id = c.id
            JOIN users u ON asub.student_id = u.id
            ORDER BY asub.submitted_at DESC
        ";
        $result = $pdo->query($detailQuery);
        if ($result) {
            $response['submissions_detail'] = $result->fetchAll(PDO::FETCH_ASSOC) ?? [];
        }
    } catch (Exception $e) {
        error_log("Detailed submissions query failed: " . $e->getMessage());
        $response['submissions_detail'] = [];
    }

    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    error_log("General error in faculty reports: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch faculty reports',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

