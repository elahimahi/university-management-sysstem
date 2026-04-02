<?php
require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

try {
    $studentId = 1;
    
    // Get student enrollments
    $stmt = $pdo->prepare("
        SELECT e.id as enrollment_id, e.student_id, c.id as course_id, c.code, c.name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY c.code
    ");
    $stmt->execute([$studentId]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get assignments with submission status
    $stmt = $pdo->prepare("
        SELECT 
            ca.id,
            ca.course_id,
            ca.title,
            ca.description,
            ca.deadline,
            c.code as course_code,
            c.name as course_name,
            CASE WHEN GETDATE() > ca.deadline THEN 1 ELSE 0 END as is_past_deadline,
            e.id as enrollment_id,
            CASE WHEN asub.id IS NOT NULL THEN 'submitted' ELSE 'not_submitted' END as submission_status,
            asub.id as submission_id
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN assignment_submissions asub ON asub.assignment_id = ca.id AND asub.enrollment_id = e.id
        WHERE e.student_id = ?
        ORDER BY ca.deadline ASC
    ");
    $stmt->execute([$studentId]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process each assignment
    $result = [];
    foreach ($assignments as $assignment) {
        $result[] = [
            'id' => (int)$assignment['id'],
            'course_id' => (int)$assignment['course_id'],
            'title' => $assignment['title'],
            'description' => $assignment['description'],
            'deadline' => $assignment['deadline'],
            'course_code' => $assignment['course_code'],
            'course_name' => $assignment['course_name'],
            'is_past_deadline' => (int)$assignment['is_past_deadline'],
            'submission_status' => $assignment['submission_status'],
            'submission_id' => $assignment['submission_id'],
            'enrollment_id' => (int)$assignment['enrollment_id']
        ];
    }
    
    echo json_encode([
        'status' => 'success',
        'count' => count($result),
        'assignments' => $result,
        'summary' => [
            'past_deadline' => count(array_filter($result, fn($a) => $a['is_past_deadline'] == 1)),
            'future_deadline' => count(array_filter($result, fn($a) => $a['is_past_deadline'] == 0)),
            'submitted' => count(array_filter($result, fn($a) => $a['submission_status'] === 'submitted')),
            'not_submitted' => count(array_filter($result, fn($a) => $a['submission_status'] === 'not_submitted'))
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
