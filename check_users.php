<?php
require_once 'backend/core/db_connect.php';
$stmt = $pdo->query('SELECT TOP 1 * FROM users');
$row = $stmt->fetch(PDO::FETCH_ASSOC);
print_r(array_keys($row));
?>