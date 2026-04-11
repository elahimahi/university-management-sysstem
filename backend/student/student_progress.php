<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Get authorization token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$userId = verifyToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

try {
    // Determine requester role once for permission checks
    $userStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    $userRole = $user['role'] ?? 'student';

    if ($method === 'POST') {
        // Student submits progress/assignment
        $enrollmentId = $data['enrollment_id'] ?? null;
        $assignmentTitle = $data['assignment_title'] ?? 'Assignment Submission';
        $submissionText = $data['submission_text'] ?? '';
        $selfRating = (int)($data['self_rating'] ?? 0); // 1-5 scale

        if (!$enrollmentId) {
            http_response_code(400);
            echo json_encode(['message' => 'enrollment_id is required']);
            exit;
        }

        // Verify this enrollment belongs to the student
        $verify = $pdo->prepare("SELECT id FROM enrollments WHERE id = ? AND student_id = ?");
        $verify->execute([$enrollmentId, $userId]);

        if (!$verify->fetch()) {
            http_response_code(403);
            echo json_encode(['message' => 'Not authorized for this enrollment']);
            exit;
        }

        // Create assignment/progress record
        $stmt = $pdo->prepare("
            INSERT INTO assignments (enrollment_id, title, submission_text, self_rating, submitted_at)
            VALUES (?, ?, ?, ?, GETDATE())
        ");

        $stmt->execute([$enrollmentId, $assignmentTitle, $submissionText, $selfRating]);

        echo json_encode([
            'success' => true,
            'message' => 'Progress submitted successfully',
            'assignment_id' => $pdo->lastInsertId()
        ]);

    } elseif ($method === 'GET') {
        $enrollmentId = $_GET['enrollment_id'] ?? null;

        // Faculty can review submissions for a specific enrollment they teach
        if ($userRole === 'faculty') {
            if (!$enrollmentId) {
                http_response_code(400);
                echo json_encode(['message' => 'enrollment_id is required for faculty view']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT
                    a.id,
                    a.title,
                    c.name as course_name,
                    a.submission_text,
                    a.self_rating,
                    a.faculty_rating,
                    a.faculty_feedback,
                    a.submitted_at,
                    a.evaluated_at
                FROM assignments a
                JOIN enrollments e ON a.enrollment_id = e.id
                JOIN courses c ON e.course_id = c.id
                WHERE a.enrollment_id = ? AND c.instructor_id = ?
                ORDER BY a.submitted_at DESC
            ");
            $stmt->execute([$enrollmentId, $userId]);
            $submissions = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'submissions' => $submissions
            ]);
            exit;
        }

        // Student view: own submissions (optional enrollment filter)
        $sql = "
            SELECT
                a.id,
                a.title,
                c.name as course_name,
                a.submission_text,
                a.self_rating,
                a.faculty_rating,
                a.faculty_feedback,
                a.submitted_at,
                a.evaluated_at
            FROM assignments a
            JOIN enrollments e ON a.enrollment_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
        ";

        $params = [$userId];
        if ($enrollmentId) {
            $sql .= " AND a.enrollment_id = ?";
            $params[] = $enrollmentId;
        }

        $sql .= " ORDER BY a.submitted_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $submissions = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
