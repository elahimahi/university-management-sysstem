<?php
require_once 'core/db_connect.php';

try {
    $stmt = $pdo->prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    $stmt->execute();
    $results = $stmt->fetchAll();
    echo 'User Role Distribution:' . PHP_EOL;
    foreach ($results as $result) {
        echo '- ' . $result['role'] . ': ' . $result['count'] . ' accounts' . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
?>