<?php

/**
 * Fetch live metal rates via browser (no SSH).
 * Visit once after adding your API key:
 * https://api.yourdomain.co.uk/fetch-rates.php?key=YOUR_CRON_SECRET
 * Delete this file after rates are working.
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$providedKey = (string) ($_GET['key'] ?? '');
$expectedKey = (string) env('CRON_SECRET', '');

header('Content-Type: application/json');

if ($expectedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden — add CRON_SECRET to .env and pass ?key=']);
    exit;
}

$apiKey = \App\Models\Setting::get('metal_api_key', config('services.metalpriceapi.key'));

if (!$apiKey) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Metal API key not configured',
        'fix' => 'Add METAL_API_KEY=your_key to .env, delete bootstrap/cache/config.php, then reload this page. Or set the key in Admin → Settings → Metal Rates API.',
    ]);
    exit;
}

$service = app(\App\Services\MetalRateService::class);
$ok = $service->fetchAndUpdateRates();

if (!$ok) {
    http_response_code(500);
    echo json_encode(['error' => 'Fetch failed — check API key and storage/logs/laravel.log']);
    exit;
}

$rates = $service->getRates();
echo json_encode([
    'ok' => true,
    'message' => 'Metal rates updated',
    'count' => count($rates['data'] ?? []),
    'data' => $rates['data'] ?? [],
], JSON_PRETTY_PRINT);
