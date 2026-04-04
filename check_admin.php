<?php
$host = 'MAHI\SQLEXPRESS';
$db = 'university_db';
$conn = sqlsrv_connect($host, array('Database' => $db, 'Authentication' => 'SqlPassword', 'UID' => 'sa', 'PWD' => 'admin'));

if ($conn) {
  echo "=== SUPER ADMIN ACCOUNTS ===\n\n";
  
  $query = "SELECT id, email, user_type FROM users WHERE user_type = 'admin' ORDER BY id";
  $result = sqlsrv_query($conn, $query);
  
  if ($result === false) {
    echo "Query failed: " . print_r(sqlsrv_errors(), true);
  } else {
    while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
      echo "ID: " . $row['id'] . "\n";
      echo "Email: " . $row['email'] . "\n";
      echo "Type: " . $row['user_type'] . "\n";
      echo "---\n";
    }
  }
  
  sqlsrv_close($conn);
} else {
  echo "Connection failed\n";
  print_r(sqlsrv_errors());
}
?>
