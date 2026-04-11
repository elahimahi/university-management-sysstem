<?php
/**
 * Redirect to check pending payments
 * This is a simple redirect endpoint
 */

// Redirect to the actual check endpoint
header('Location: check_pending_payments.php');
exit;
?>
