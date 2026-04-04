<?php
// CORS headers are now set in index.php
// This file only handles database connection

$host = 'MAHI\SQLEXPRESS';
$db   = 'university_db';

// For Windows Authentication
$dsn = "sqlsrv:Server=$host;Database=$db;Encrypt=true;TrustServerCertificate=true";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
     // Passing null for user and password triggers Windows Authentication
     $pdo = new PDO($dsn, null, null, $options);
} catch (\PDOException $e) {
     http_response_code(500);
     echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
     exit;
}
?>
