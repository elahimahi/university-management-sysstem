<?php
require_once __DIR__ . '/../core/db_connect.php';

try {
    $stmt = $pdo->query('SELECT TOP 10 id, email, first_name, last_name, role FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'users' => $users], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
?>
