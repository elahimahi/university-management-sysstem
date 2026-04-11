<?php
require 'core/db_connect.php';

echo "=== ATTENDANCE TABLE SCHEMA ===\n\n";

$stmt = $pdo->query("
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'attendance'
    ORDER BY ORDINAL_POSITION
");

while ($row = $stmt->fetch()) {
    echo $row['COLUMN_NAME'] . " (" . $row['DATA_TYPE'] . ")" . ($row['IS_NULLABLE'] === 'NO' ? ' NOT NULL' : '') . "\n";
}
?>
