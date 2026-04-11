<?php
// Faculty - Post Assignment
// POST /faculty/post_assignment.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../core/db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Validate required fields
    $required = ['title', 'description', 'course_id', 'due_datetime', 'faculty_id'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    $title = trim($data['title']);
    $description = trim($data['description']);
    $course_id = (int)$data['course_id'];
    $faculty_id = (int)$data['faculty_id'];
    $due_datetime = $data['due_datetime'];
    $instructions = trim($data['instructions'] ?? '');
    $max_score = (int)($data['max_score'] ?? 100);
    $allow_late = (int)($data['allow_late_submission'] ?? 1);
    $late_days = (int)($data['late_submission_days'] ?? 3);

    // Validate course belongs to faculty
    $stmt = $conn->prepare("
        SELECT id FROM courses 
        WHERE id = ? AND faculty_id = ?
    ");
    $stmt->execute([$course_id, $faculty_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Course not found or access denied']);
        exit;
    }

    // Insert assignment
    $stmt = $conn->prepare("
        INSERT INTO assignments (
            course_id, faculty_id, title, description, 
            instructions, due_date, max_score, 
            allow_late_submission, late_submission_days,
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
    ");

    $result = $stmt->execute([
        $course_id,
        $faculty_id,
        $title,
        $description,
        $instructions,
        $due_datetime,
        $max_score,
        $allow_late,
        $late_days,
        'active'
    ]);

    if ($result) {
        // Get the newly created assignment ID
        $stmt = $conn->prepare("
            SELECT TOP 1 id FROM assignments 
            WHERE course_id = ? AND faculty_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$course_id, $faculty_id]);
        $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Assignment posted successfully',
            'id' => $assignment['id'] ?? null
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create assignment']);
    }

} catch (PDOException $e) {
    error_log('Database error in post_assignment.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . substr($e->getMessage(), 0, 100)]);
} catch (Exception $e) {
    error_log('Error in post_assignment.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
