<?php
/**
 * Initialize test assignments
 * POST /debug/init-assignments
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Check if course_assignments table exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'course_assignments'");
    $stmt->execute();
    $exists = $stmt->fetchColumn();
    
    if (!$exists) {
        // Create table if it doesn't exist
        $pdo->exec("
        CREATE TABLE course_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            description TEXT,
            deadline DATETIME NOT NULL,
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
        ");
        
        echo json_encode(['message' => 'course_assignments table created']);
    }
    
    // Check if assignment_submissions table exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'assignment_submissions'");
    $stmt->execute();
    $exists = $stmt->fetchColumn();
    
    if (!$exists) {
        // Create table if it doesn't exist
        $pdo->exec("
        CREATE TABLE assignment_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assignment_id INT NOT NULL,
            student_id INT NOT NULL,
            submission_text TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('submitted', 'late') DEFAULT 'submitted',
            faculty_feedback TEXT,
            grade VARCHAR(20),
            evaluated_at TIMESTAMP NULL,
            FOREIGN KEY (assignment_id) REFERENCES course_assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(assignment_id, student_id)
        )
        ");
        
        echo json_encode(['message' => 'assignment_submissions table created']);
    }
    
    // Clear existing test assignments
    $pdo->exec("DELETE FROM assignment_submissions");
    $pdo->exec("DELETE FROM course_assignments");
    
    // Insert test assignments for course 5 (taught by faculty_id = 2)
    $pdo->exec("
    INSERT INTO course_assignments (course_id, title, description, deadline, created_by)
    VALUES 
    (5, 'Database Design Project', 'Design a normalized database schema for an e-commerce system', '2026-04-15 14:00:00', 2),
    (5, 'SQL Query Assignment', 'Write 5 SQL queries to solve given business problems', '2026-04-20 10:00:00', 2),
    (7, 'Web Development Final Project', 'Build a responsive website using HTML, CSS, and JavaScript', '2026-04-25 23:59:59', 3)
    ");
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Test data initialized successfully',
        'assignments_created' => 3
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
