<?php

/**
 * Clear Laravel route/config cache on Hostinger (no SSH).
 * Visit once: https://api.yourdomain.co.uk/clear-cache.php?key=YOUR_CRON_SECRET
 * Delete this file after use.
 */

declare(strict_types=1);

require __DIR__ . '/hostinger-env.php';

header('Content-Type: application/json');

$key = (string) ($_GET['key'] ?? '');
$secret = hostinger_env('CRON_SECRET');

if ($secret === '' || !hash_equals($secret, $key)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden — pass ?key=CRON_SECRET from .env']);
    exit;
}

$removed = [];
foreach (['routes-v7.php', 'config.php', 'services.php', 'packages.php'] as $file) {
    $path = dirname(__DIR__) . '/bootstrap/cache/' . $file;
    if (is_file($path) && @unlink($path)) {
        $removed[] = $file;
    }
}

echo json_encode([
    'ok' => true,
    'message' => 'Cache cleared. Upload routes/api.php if test-email route was missing.',
    'removed' => $removed,
]);
