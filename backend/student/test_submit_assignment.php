<?php
/**
 * Test Assignment Submission
 * For testing without UI interaction
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';

try {
    echo "=== Assignment Submission Test ===\n\n";
    
    // Find a student enrollment
    $stmt = $pdo->query("SELECT TOP 1 id, student_id, course_id FROM enrollments WHERE status = 'active'");
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    $enrollment['enrollment_id'] = $enrollment['id'];
    
    if (!$enrollment) {
        echo "No active enrollments found\n";
        exit;
    }
    
    echo "Test Enrollment: " . json_encode($enrollment) . "\n\n";
    
    // Find an assignment for this course
    $stmt = $pdo->prepare("SELECT TOP 1 id FROM course_assignments WHERE course_id = ?");
    $stmt->execute([$enrollment['course_id']]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        echo "No assignments found for course\n";
        exit;
    }
    
    echo "Test Assignment ID: {$assignment['id']}\n\n";
    
    // Simulate submission
    $testSubmission = [
        'assignment_id' => $assignment['id'],
        'submission_text' => 'Test submission at ' . date('Y-m-d H:i:s'),
        'student_id' => $enrollment['student_id']
    ];
    
    // Check if already submitted
    $stmt = $pdo->prepare("SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?");
    $stmt->execute([$testSubmission['assignment_id'], $testSubmission['student_id']]);
    
    if ($stmt->fetch()) {
        echo "Already submitted - skipping\n";
    } else {
        // Insert
        $stmt = $pdo->prepare("INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, status) VALUES (?, ?, ?, 'submitted')");
        $stmt->execute([$testSubmission['assignment_id'], $testSubmission['student_id'], $testSubmission['submission_text']]);
        echo "Submission inserted successfully!\n";
    }
    
    // Show all submissions for this assignment
    echo "\n=== All Submissions for Assignment {$assignment['id']} ===\n";
    $stmt = $pdo->prepare("SELECT * FROM assignment_submissions WHERE assignment_id = ?");
    $stmt->execute([$assignment['id']]);
    foreach ($stmt->fetchAll() as $sub) {
        echo json_encode($sub) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
