<?php
require 'core/db_connect.php';

echo "=== Database Contents ===\n\n";

// Check students
echo "STUDENTS:\n";
$stmt = $pdo->query('SELECT TOP 10 id, email, first_name, role FROM users ORDER BY id');
while ($row = $stmt->fetch()) {
    echo "  ID {$row['id']}: {$row['first_name']} ({$row['role']})\n";
}

// Check courses
echo "\nCOURSES:\n";
$stmt = $pdo->query('SELECT TOP 10 id, code, name, instructor_id FROM courses ORDER BY id');
while ($row = $stmt->fetch()) {
    echo "  ID {$row['id']}: {$row['code']} - {$row['name']} (instructor {$row['instructor_id']})\n";
}

// Check enrollments
echo "\nENROLLMENTS:\n";
$stmt = $pdo->query('SELECT TOP 10 id, student_id, course_id, status FROM enrollments ORDER BY id');
while ($row = $stmt->fetch()) {
    echo "  {$row['id']}: student {$row['student_id']}, course {$row['course_id']}, status {$row['status']}\n";
}

// Check attendance
echo "\nATTENDANCE:\n";
$stmt = $pdo->query('SELECT COUNT(*) as cnt FROM attendance');
$count = $stmt->fetch()['cnt'];
echo "  Total records: $count\n";

echo "\nSUGGESTED TEST DATA:\n";
$stmt = $pdo->query('SELECT TOP 1 id FROM enrollments WHERE student_id = 23');
$enr = $stmt->fetch();
if ($enr) {
    echo "  Use student_id: 23, course_id from enrollment\n";
}
?>
