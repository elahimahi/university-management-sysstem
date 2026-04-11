<?php
ob_start();

// Exactly what login.php is doing
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

echo "DEBUG: origin='" . $origin . "'\n";
echo "DEBUG: is_in_array=" . (in_array($origin, $allowed_origins) ? 'YES' : 'NO') . "\n";
echo "DEBUG: not_empty=" . (!empty($origin) ? 'YES' : 'NO') . "\n";

if (in_array($origin, $allowed_origins) && !empty($origin)) {
    echo "DEBUG: Setting to specific origin\n";
    header('Access-Control-Allow-Origin: ' . $origin, true);
} elseif (empty($origin)) {
    echo "DEBUG: No origin, setting to localhost\n";
    header('Access-Control-Allow-Origin: http://localhost', true);
} else {
    echo "DEBUG: Unknown origin\n";
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

header('Access-Control-Allow-Credentials: true', true);
http_response_code(200);
?>
