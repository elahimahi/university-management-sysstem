<?php
require_once __DIR__ . '/core/db_connect.php';

try {
    $pdo->exec('ALTER TABLE payments ADD phone_or_account VARCHAR(50) NULL');
    echo 'Column phone_or_account added successfully!';
} catch (Exception $e) {
    echo 'Already exists or error: ' . $e->getMessage();
}
?>
