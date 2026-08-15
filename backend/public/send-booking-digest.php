<?php

/**
 * Send admin today's + tomorrow's appointments digest.
 * https://api.finejewellerybuyers.co.uk/send-booking-digest.php?key=YOUR_CRON_SECRET
 * Add &force=1 to send again the same day.
 */

declare(strict_types=1);

require __DIR__ . '/hostinger-env.php';

$providedKey = (string) ($_GET['key'] ?? '');
$expectedKey = hostinger_env('CRON_SECRET');

header('Content-Type: application/json');

if ($expectedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$force = isset($_GET['force']);
$result = app(\App\Services\BookingMailService::class)->sendDailyDigest($force);

echo json_encode($result, JSON_PRETTY_PRINT);
