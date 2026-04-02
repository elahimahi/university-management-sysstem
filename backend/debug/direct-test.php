<?php
/**
 * Direct test of student assignments endpoint
 * This endpoint simulates authentication for testing
 */

// Temporarily override authentication for testing
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer test_token_for_student_1';

// Create mock user for testing
class MockUser {
    public $id = 1;
    public $role = 'student';
    
    public function offsetExists($key) { return isset($this->$key); }
    public function offsetGet($key) { return $this->$key; }
    public function offsetSet($key, $value) { $this->$key = $value; }
    public function offsetUnset($key) { unset($this->$key); }
}

// Override getAuthenticatedUser temporarily
if (!function_exists('override_auth')) {
    function override_auth() {
        $user = new stdClass();
        $user->id = 1;
        $user->role = 'student';
        return (array)$user;
    }
}

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    $user = override_auth();  // Use test user
    
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

    $assignments = [];
    
    // Step 1: Get student's enrolled courses and enrollment IDs
    $stmt = $pdo->prepare("SELECT id as enrollment_id, course_id FROM enrollments WHERE student_id = ? AND status = 'active'");
    $stmt->execute([$user['id']]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($enrollments) > 0) {
        // Step 2: Get assignments for those courses
        $courseIds = array_column($enrollments, 'course_id');
        $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
        
        $sql = "
            SELECT ca.id, ca.course_id, ca.title, ca.description, ca.deadline, ca.created_by,
                   c.code as course_code, c.name as course_name
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            WHERE ca.course_id IN ($placeholders)
            ORDER BY ca.deadline DESC
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($courseIds);
        $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Step 3: Add submission info using enrollment_id
        foreach ($assignments as &$assignment) {
            // Find the enrollment ID for this course
            $enrollmentId = null;
            foreach ($enrollments as $enr) {
                if ($enr['course_id'] == $assignment['course_id']) {
                    $enrollmentId = $enr['enrollment_id'];
                    break;
                }
            }
            
            $submission = null;
            if ($enrollmentId) {
                $subStmt = $pdo->prepare("
                    SELECT id, submission_text, submitted_at, feedback_notes, feedback_status, is_late
                    FROM assignment_submissions
                    WHERE assignment_id = ? AND enrollment_id = ?
                ");
                $subStmt->execute([$assignment['id'], $enrollmentId]);
                $submission = $subStmt->fetch(PDO::FETCH_ASSOC);
            }
            
            $assignment['submission_id'] = $submission ? intval($submission['id']) : 0;
            $assignment['submission_text'] = $submission ? $submission['submission_text'] : '';
            $assignment['submitted_at'] = $submission ? $submission['submitted_at'] : '';
            $assignment['grade'] = $submission ? $submission['feedback_status'] : '';
            $assignment['faculty_feedback'] = $submission ? $submission['feedback_notes'] : '';
            $assignment['submission_status'] = $submission ? ($submission['is_late'] ? 'late' : 'submitted') : 'not_submitted';
            $assignment['is_past_deadline'] = strtotime($assignment['deadline']) < time() ? 1 : 0;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'assignments' => $assignments,
        'total' => count($assignments)
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log('Student assignments PDO error: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Student assignments error: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
