<?php
// Faculty - Send Message
// POST /faculty/send_message.php

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
    $required = ['subject', 'message', 'course_id', 'recipients', 'faculty_id'];
    foreach ($required as $field) {
        if (empty($data[$field]) && $field !== 'selected_students') {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    $subject = trim($data['subject']);
    $message = trim($data['message']);
    $course_id = (int)$data['course_id'];
    $faculty_id = (int)$data['faculty_id'];
    $recipients = $data['recipients'];
    $message_type = $data['message_type'] ?? 'general';
    $priority = $data['priority'] ?? 'normal';
    $send_email = (int)($data['send_email'] ?? 1);
    $selected_students = $data['selected_students'] ?? [];

    if (!in_array($recipients, ['all', 'specific'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid recipients value']);
        exit;
    }

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

    // Get recipient list
    $recipient_ids = [];
    
    if ($recipients === 'all') {
        // Get all students enrolled in course
        $stmt = $conn->prepare("
            SELECT DISTINCT u.id FROM users u
            INNER JOIN enrollments e ON u.id = e.student_id
            WHERE e.course_id = ? AND u.role = 'student'
        ");
        $stmt->execute([$course_id]);
        $student_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($student_rows as $row) {
            $recipient_ids[] = $row['id'];
        }
    } else if ($recipients === 'specific') {
        if (empty($selected_students)) {
            http_response_code(400);
            echo json_encode(['error' => 'No students selected']);
            exit;
        }
        $recipient_ids = array_map('intval', $selected_students);
    }

    if (empty($recipient_ids)) {
        http_response_code(400);
        echo json_encode(['error' => 'No recipients found']);
        exit;
    }

    // Create message table if not exists
    $conn->exec("
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'messages')
        CREATE TABLE messages (
            id INT PRIMARY KEY IDENTITY(1,1),
            sender_id INT NOT NULL,
            course_id INT NOT NULL,
            subject NVARCHAR(MAX),
            message NVARCHAR(MAX),
            message_type NVARCHAR(50),
            priority NVARCHAR(20),
            send_email BIT,
            created_at DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    ");

    $conn->exec("
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'message_recipients')
        CREATE TABLE message_recipients (
            id INT PRIMARY KEY IDENTITY(1,1),
            message_id INT NOT NULL,
            recipient_id INT NOT NULL,
            is_read BIT DEFAULT 0,
            read_at DATETIME NULL,
            FOREIGN KEY (message_id) REFERENCES messages(id),
            FOREIGN KEY (recipient_id) REFERENCES users(id)
        )
    ");

    // Insert main message
    $stmt = $conn->prepare("
        INSERT INTO messages (
            sender_id, course_id, subject, message, 
            message_type, priority, send_email, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
    ");

    $result = $stmt->execute([
        $faculty_id,
        $course_id,
        $subject,
        $message,
        $message_type,
        $priority,
        $send_email
    ]);

    if (!$result) {
        throw new Exception('Failed to create message');
    }

    // Get the message ID
    $stmt = $conn->prepare("
        SELECT TOP 1 id FROM messages 
        WHERE sender_id = ? AND course_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$faculty_id, $course_id]);
    $msg_row = $stmt->fetch(PDO::FETCH_ASSOC);
    $message_id = $msg_row['id'];

    // Insert recipients
    $stmt = $conn->prepare("
        INSERT INTO message_recipients (message_id, recipient_id, is_read)
        VALUES (?, ?, 0)
    ");

    $sent_count = 0;
    foreach ($recipient_ids as $recipient_id) {
        try {
            $stmt->execute([$message_id, $recipient_id]);
            $sent_count++;
        } catch (Exception $e) {
            error_log("Failed to send to recipient $recipient_id: " . $e->getMessage());
        }
    }

    // If email notification is enabled, queue emails (simplified)
    if ($send_email && $sent_count > 0) {
        // TODO: Implement email queue
        // For now, just log that emails would be sent
        error_log("Email notifications would be sent to $sent_count students");
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => "Message sent to $sent_count student" . ($sent_count !== 1 ? 's' : ''),
        'sent_count' => $sent_count,
        'message_id' => $message_id
    ]);

} catch (PDOException $e) {
    error_log('Database error in send_message.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . substr($e->getMessage(), 0, 100)]);
} catch (Exception $e) {
    error_log('Error in send_message.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
