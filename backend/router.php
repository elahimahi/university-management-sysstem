<?php
/**
 * Development Router for PHP Built-in Server
 * This ensures ALL requests (including OPTIONS preflight) are routed through index.php
 */

$requested_file = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If a file or directory actually exists on disk, serve it
if (is_file($requested_file) || is_dir($requested_file)) {
    return false;
}

// Everything else goes through the API router
require __DIR__ . '/index.php';
?>
