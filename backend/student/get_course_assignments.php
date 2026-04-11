<?php
/**
 * Get Course Assignments Endpoint
 * GET /student/assignments
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Temporary debugging helpers
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function tableExists(PDO $pdo, string $tableName): bool {
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?");
    $stmt->execute([$tableName]);
    return intval($stmt->fetchColumn() ?? 0) > 0;
}

$user = getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

if ($user['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Only students can access this resource']);
    exit();
}

try {
    $assignments = [];
    
    // Step 1: Get student's enrolled courses and enrollment IDs
    $stmt = $pdo->prepare("SELECT id as enrollment_id, course_id FROM enrollments WHERE student_id = ? AND status = 'active'");
    $stmt->execute([$user['id']]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($enrollments) > 0) {
        if (tableExists($pdo, 'assignment_submissions')) {
            $stmt = $pdo->prepare("SELECT
                    ca.id,
                    ca.course_id,
                    ca.title,
                    ca.description,
                    ca.deadline,
                    c.code as course_code,
                    c.name as course_name,
                    CASE WHEN GETDATE() > ca.deadline THEN 1 ELSE 0 END as is_past_deadline,
                    asub.id as submission_id,
                    asub.submission_text,
                    asub.submitted_at,
                    asub.feedback_status,
                    asub.feedback_notes,
                    asub.is_late
                FROM course_assignments ca
                JOIN courses c ON ca.course_id = c.id
                JOIN enrollments e ON e.course_id = c.id
                LEFT JOIN assignment_submissions asub ON asub.assignment_id = ca.id AND asub.enrollment_id = e.id
                WHERE e.student_id = ? AND e.status = 'active'
                ORDER BY ca.deadline DESC");
            $stmt->execute([$user['id']]);
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($assignments as &$assignment) {
                $assignment['submission_id'] = isset($assignment['submission_id']) ? intval($assignment['submission_id']) : 0;
                $assignment['submission_text'] = $assignment['submission_text'] ?? '';
                $assignment['submitted_at'] = $assignment['submitted_at'] ?? '';
                $assignment['grade'] = $assignment['feedback_status'] ?? '';
                $assignment['faculty_feedback'] = $assignment['feedback_notes'] ?? '';

                $isLateFlag = isset($assignment['is_late']) && $assignment['is_late'];
                $isActuallyLate = false;
                if ($assignment['submission_id'] && $assignment['submitted_at'] && $assignment['deadline']) {
                    try {
                        $submittedAt = new DateTime($assignment['submitted_at']);
                        $deadline = new DateTime($assignment['deadline']);
                        $isActuallyLate = $submittedAt > $deadline;
                    } catch (Exception $e) {
                        $isActuallyLate = false;
                    }
                }

                $assignment['submission_status'] = $assignment['submission_id']
                    ? (($isLateFlag || $isActuallyLate) ? 'late' : 'submitted')
                    : 'not_submitted';
            }
        } else {
            $courseIds = array_column($enrollments, 'course_id');
            $placeholders = implode(',', array_fill(0, count($courseIds), '?'));

            $sql = "
                SELECT ca.id, ca.course_id, ca.title, ca.description, ca.deadline,
                       c.code as course_code, c.name as course_name,
                       CASE WHEN GETDATE() > ca.deadline THEN 1 ELSE 0 END as is_past_deadline
                FROM course_assignments ca
                JOIN courses c ON ca.course_id = c.id
                WHERE ca.course_id IN ($placeholders)
                ORDER BY ca.deadline DESC
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($courseIds);
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($assignments as &$assignment) {
                $assignment['submission_id'] = 0;
                $assignment['submission_text'] = '';
                $assignment['submitted_at'] = '';
                $assignment['grade'] = '';
                $assignment['faculty_feedback'] = '';
                $assignment['submission_status'] = 'not_submitted';
            }
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'assignments' => $assignments,
        'total' => count($assignments)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    $errorMessage = 'Student assignments PDO error: ' . $e->getMessage();
    error_log($errorMessage);
    file_put_contents(__DIR__ . '/../debug/student_assignments_error.log', $errorMessage . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    $errorMessage = 'Student assignments error: ' . $e->getMessage();
    error_log($errorMessage);
    file_put_contents(__DIR__ . '/../debug/student_assignments_error.log', $errorMessage . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>