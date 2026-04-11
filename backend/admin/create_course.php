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

$rawBody = file_get_contents("php://input");
$data = json_decode($rawBody, true);
if (!is_array($data)) {
    $data = $_POST ?: [];
}
error_log("CREATE_COURSE: Received raw body: " . $rawBody);
error_log("CREATE_COURSE: Parsed data: " . json_encode($data));

$courseCode = strtoupper(preg_replace('/\s+/', ' ', trim($data['code'] ?? $data['course_code'] ?? '')));
$courseName = trim($data['name'] ?? $data['course_name'] ?? '');
$credits = isset($data['credits']) ? intval($data['credits']) : 3;
$category = isset($data['category']) ? trim($data['category']) : 'General';
$level = isset($data['level']) ? trim($data['level']) : 'Undergraduate';
$instructorId = (isset($data['instructor_id']) && $data['instructor_id'] !== '' && intval($data['instructor_id']) > 0)
    ? intval($data['instructor_id'])
    : null;

if ($courseCode === '' || $courseName === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Course code and name are required']);
    exit;
}

try {
    error_log("CREATE_COURSE: Attempting to create course with code=" . $courseCode . ", name=" . $courseName);

    // Prevent duplicate course codes before insert
    $check = $pdo->prepare("SELECT COUNT(*) as count FROM courses WHERE REPLACE(LOWER(LTRIM(RTRIM(code))), ' ', '') = REPLACE(LOWER(LTRIM(RTRIM(?))), ' ', '')");
    $check->execute([$courseCode]);
    $exists = $check->fetch();
    if ($exists && (int)$exists['count'] > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Course code already exists']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO courses (code, name, credits, category, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $courseCode,
        $courseName,
        $credits,
        $category,
        $level,
        $instructorId
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
    $message = $e->getMessage();
    if ($e->getCode() == 23000) {
        if (stripos($message, 'foreign key') !== false || stripos($message, 'constraint') !== false) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid instructor_id or database constraint violation']);
        } else {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Course code already exists']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $message]);
    }
}
?>
