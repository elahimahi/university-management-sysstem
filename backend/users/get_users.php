<?php
// 1. Include your existing database connection
require_once __DIR__ . '/../core/db_connect.php';

// Allow any frontend app to access this data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // 2. Write your SQL query. 
    // We will fetch the top 10 students or faculty members.
    $sql = "SELECT TOP 10 id, first_name, last_name, email, role FROM users";
    
    // 3. Prepare and Execute the query using PDO
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // 4. Fetch all the results into an array
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Send the data back as JSON
    // 'json_encode' converts the PHP array into a JSON string the React frontend can read
    echo json_encode([
        "status" => "success",
        "count" => count($results),
        "data" => $results
    ]);

} catch (PDOException $e) {
    // If there is an error (like a typo in SQL), catch it and return an error message
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database fetch failed: " . $e->getMessage()
    ]);
}
?>
