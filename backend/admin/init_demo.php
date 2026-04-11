<?php
/**
 * Initialize Demo Data Endpoint
 * POST /admin/init-demo
 * 
 * Creates demo faculty user and sample courses for testing
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Check if demo faculty already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'faculty'");
    $stmt->execute(['faculty_demo@university.edu']);
    $faculty = $stmt->fetch();

    if (!$faculty) {
        // Create demo faculty user
        $hashedPassword = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, approval_status, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute(['faculty_demo@university.edu', $hashedPassword, 'John', 'Doe', 'faculty', 'approved', 1]);
        $facultyId = $pdo->lastInsertId();
    } else {
        $facultyId = $faculty['id'];
    }

    // Check if demo student already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'student'");
    $stmt->execute(['student_demo@university.edu']);
    $student = $stmt->fetch();

    if (!$student) {
        // Create demo student user
        $hashedPassword = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, approval_status, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute(['student_demo@university.edu', $hashedPassword, 'Jane', 'Smith', 'student', 'approved', 1]);
        $studentId = $pdo->lastInsertId();
    } else {
        $studentId = $student['id'];
    }

    // Check if demo courses already exist
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?");
    $stmt->execute([$facultyId]);
    $result = $stmt->fetch();
    $courseCount = $result['count'] ?? 0;

    if ($courseCount == 0) {
        // Add sample courses
        $courses = [
            ['CS101', 'Introduction to Computer Science', 3, 'Core', 'Undergraduate'],
            ['CS201', 'Data Structures', 3, 'Core', 'Undergraduate'],
            ['MATH101', 'Calculus I', 4, 'Core', 'Undergraduate'],
        ];

        $addedCount = 0;
        foreach ($courses as $course) {
            try {
                // Check if course code already exists
                $checkStmt = $pdo->prepare("SELECT id FROM courses WHERE code = ?");
                $checkStmt->execute([$course[0]]);
                if (!$checkStmt->fetch()) {
                    $stmt = $pdo->prepare("INSERT INTO courses (code, name, credits, category, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$course[0], $course[1], $course[2], $course[3], $course[4], $facultyId]);
                    $addedCount++;
                }
            } catch (PDOException $e) {
                // Skip duplicate courses
                continue;
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Demo data initialized successfully',
        'faculty' => [
            'email' => 'faculty_demo@university.edu',
            'password' => 'password123'
        ],
        'student' => [
            'email' => 'student_demo@university.edu',
            'password' => 'password123'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to initialize demo data: ' . $e->getMessage()
    ]);
}
?>
