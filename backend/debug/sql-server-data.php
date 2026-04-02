<?php
/**
 * Direct SQL Server Query Test
 * Shows all assignments from course_assignments table
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    echo "=== STUDENT ASSIGNMENTS DATA FROM SQL SERVER ===\n\n";
    
    // 1. Check course_assignments table
    echo "1. COURSE ASSIGNMENTS TABLE:\n";
    $stmt = $pdo->query("SELECT TOP 10 * FROM course_assignments ORDER BY deadline DESC");
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'table' => 'course_assignments',
        'total_records' => count($assignments),
        'records' => $assignments
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";
    
    // 2. Check assignment_submissions table
    echo "2. ASSIGNMENT SUBMISSIONS TABLE:\n";
    $stmt = $pdo->query("SELECT TOP 10 * FROM assignment_submissions ORDER BY submitted_at DESC");
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'table' => 'assignment_submissions',
        'total_records' => count($submissions),
        'records' => $submissions
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";
    
    // 3. Check enrollments for student 1
    echo "3. STUDENT 1 ENROLLMENTS:\n";
    $stmt = $pdo->prepare("SELECT * FROM enrollments WHERE student_id = 1 AND status = 'active'");
    $stmt->execute();
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'student_id' => 1,
        'total_enrollments' => count($enrollments),
        'enrollments' => $enrollments
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";
    
    // 4. Complete assignment query for student 1
    echo "4. COMPLETE ASSIGNMENTS QUERY FOR STUDENT 1:\n";
    $stmt = $pdo->prepare("
        SELECT 
            ca.id,
            ca.course_id,
            ca.title,
            ca.description,
            ca.deadline,
            ca.created_by,
            c.code as course_code,
            c.name as course_name,
            CAST(datediff(hour, getdate(), ca.deadline) as INT) as hours_until_deadline
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        WHERE ca.course_id IN (
            SELECT course_id FROM enrollments 
            WHERE student_id = 1 AND status = 'active'
        )
        ORDER BY ca.deadline DESC
    ");
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'student_id' => 1,
        'total_assignments' => count($result),
        'assignments' => $result
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}
?>
