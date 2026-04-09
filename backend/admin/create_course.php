<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);
error_log("CREATE_COURSE: Received data: " . json_encode($data));

if (!isset($data['code']) || !isset($data['name'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Course code and name are required']);
    exit;
}

try {
    $courseCode = strtoupper(preg_replace('/\s+/', ' ', trim($data['code'])));
    $courseName = trim($data['name']);
    error_log("CREATE_COURSE: Attempting to create course with code=" . $courseCode . ", name=" . $courseName);

    if ($courseCode === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Course code is required']);
        exit;
    }

    // Prevent duplicate course codes before insert
    $check = $pdo->prepare("SELECT COUNT(*) as count FROM courses WHERE REPLACE(LOWER(LTRIM(RTRIM(code))), ' ', '') = REPLACE(LOWER(LTRIM(RTRIM(?))), ' ', '')");
    $check->execute([$courseCode]);
    $exists = $check->fetch();
    if ($exists && (int)$exists['count'] > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Course code already exists']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO courses (code, name, credits, category, level, instructor_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $courseCode,
        $courseName,
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id'] ?? null
    ]);
    
    error_log("CREATE_COURSE: Successfully created course");

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course created successfully',
        'course_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    error_log("CREATE_COURSE: PDO Error - " . $e->getMessage());
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Course code already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
