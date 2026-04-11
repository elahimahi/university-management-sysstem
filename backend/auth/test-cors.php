<?php
ob_start();
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'NO_ORIGIN';
header('X-DEBUG-ORIGIN: ' . $origin);
header('X-DEBUG-ALLOWED: ' . (in_array($origin, array('http://localhost:3000')) ? 'YES' : 'NO'));
if (!empty($origin) && $origin === 'http://localhost:3000') {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
echo "DEBUG_ORIGIN=$origin";
?>
