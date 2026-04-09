<?php
// CORS headers are now set in index.php
// This file only handles database connection

<<<<<<< HEAD
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

<<<<<<< HEAD
$host = 'MAHI\SQLEXPRESS';
=======
=======
>>>>>>> dev
$host = 'DESKTOP-83A2G7T\SQLEXPRESS';
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db
$db   = 'university_db';

// For Windows Authentication - Disable encryption for local development
$dsn = "sqlsrv:Server=$host;Database=$db;Encrypt=no;TrustServerCertificate=false";
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
