<?php
/**
 * Test endpoint - debug student assignments
 * GET /debug/test-student-assignments
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Simulate a student with ID 1 (we know they exist from the diagnostic)
    $student_id = 1;
    
    // Step 1: Get enrolled courses
    $stmt = $pdo->prepare("SELECT id as enrollment_id, course_id FROM enrollments WHERE student_id = ? AND status = 'active'");
    $stmt->execute([$student_id]);
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
        
        // Step 3: Add submission info
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
        
        echo json_encode([
            'status' => 'success',
            'assignments' => $assignments,
            'total' => count($assignments)
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'status' => 'success',
            'assignments' => [],
            'total' => 0,
            'message' => 'No enrolled courses'
        ], JSON_PRETTY_PRINT);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'error_info' => $e->errorInfo ?? null
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
