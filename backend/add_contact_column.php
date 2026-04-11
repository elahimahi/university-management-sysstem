<?php
require_once __DIR__ . '/core/db_connect.php';

try {
    $pdo->exec('ALTER TABLE payment_transactions ADD contact_info VARCHAR(50) NULL');
    echo 'Column added to payment_transactions successfully';
} catch (Exception $e) {
    echo 'Already exists or error: ' . $e->getMessage();
}
?>
