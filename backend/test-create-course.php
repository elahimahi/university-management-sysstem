<?php
// Test course creation directly

header('Content-Type: application/json; charset=utf-8');

// Test 1: Check database connection
require_once __DIR__ . '/core/db_connect.php';

$response = ['tests' => []];

try {
    $response['tests'][] = ['name' => 'Database Connection', 'status' => 'OK', 'time' => date('Y-m-d H:i:s')];
} catch (Exception $e) {
    $response['tests'][] = ['name' => 'Database Connection', 'status' => 'FAILED', 'error' => $e->getMessage()];
    echo json_encode($response);
    exit;
}

// Test 2: Check courses table exists
try {
    $result = $pdo->query("SELECT TOP 1 * FROM courses");
    $response['tests'][] = ['name' => 'Courses Table', 'status' => 'OK', 'message' => 'Table exists'];
} catch (Exception $e) {
    $response['tests'][] = ['name' => 'Courses Table', 'status' => 'FAILED', 'error' => $e->getMessage()];
}

// Test 3: Try to create a test course
try {
    $testCode = 'TEST_' . uniqid();
    $stmt = $pdo->prepare("
        INSERT INTO courses (code, name, credits, category, level, instructor_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        $testCode,
        'Test Course',
        3,
        'General',
        'Undergraduate',
        null
    ]);
    
    $lastId = $pdo->lastInsertId();
    $response['tests'][] = [
        'name' => 'Insert Test Course',
        'status' => 'OK',
        'message' => 'Course created successfully',
        'course_id' => $lastId,
        'course_code' => $testCode
    ];
    
    // Clean up - delete the test course
    $pdo->prepare("DELETE FROM courses WHERE id = ?")->execute([$lastId]);
    
} catch (Exception $e) {
    $response['tests'][] = [
        'name' => 'Insert Test Course',
        'status' => 'FAILED',
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ];
}

// Test 4: Check course count
try {
    $count = $pdo->query("SELECT COUNT(*) as cnt FROM courses")->fetch()['cnt'];
    $response['tests'][] = [
        'name' => 'Course Count',
        'status' => 'OK',
        'message' => 'Found ' . $count . ' courses'
    ];
} catch (Exception $e) {
    $response['tests'][] = [
        'name' => 'Course Count',
        'status' => 'FAILED',
        'error' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
