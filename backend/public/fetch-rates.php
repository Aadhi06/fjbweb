<?php

/**
 * Fetch live metal rates via browser (no SSH).
 * https://api.yourdomain.co.uk/fetch-rates.php?key=YOUR_CRON_SECRET
 * Add &test=1 to diagnose API key only.
 */

declare(strict_types=1);

require __DIR__ . '/hostinger-env.php';

$providedKey = (string) ($_GET['key'] ?? '');
$expectedKey = hostinger_env('CRON_SECRET');

header('Content-Type: application/json');

if ($expectedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Forbidden',
        'fix' => 'Add CRON_SECRET=YourSecret123 to public_html/api/.env then open this URL with ?key=YourSecret123 (must match exactly).',
    ]);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$apiKey = trim(hostinger_env('METAL_API_KEY'));

if ($apiKey === '') {
    http_response_code(400);
    echo json_encode([
        'error' => 'Metal API key not configured',
        'fix' => 'Add METAL_API_KEY=your_key to public_html/api/.env (no quotes, no spaces).',
    ]);
    exit;
}

// Always use .env key on Hostinger (overrides stale DB / cached config)
\App\Models\Setting::set('metal_api_key', $apiKey, 'text', 'api', 'Metal API Key');
\App\Models\Setting::set('metal_api_provider', hostinger_env('METAL_API_PROVIDER', 'metalpriceapi'), 'text', 'api', 'Metal API Provider');

$service = app(\App\Services\MetalRateService::class);

if (isset($_GET['test'])) {
    $test = $service->testMetalPriceApi($apiKey);
    echo json_encode([
        'key_length' => strlen($apiKey),
        'key_preview' => substr($apiKey, 0, 4) . '...' . substr($apiKey, -4),
        'test' => $test,
        'last_error' => $service->getLastError(),
    ], JSON_PRETTY_PRINT);
    exit;
}

$ok = $service->fetchAndUpdateRates($apiKey);

if (!$ok) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Fetch failed',
        'detail' => $service->getLastError(),
        'fix' => '1) Log in at metalpriceapi.com and copy a fresh API key. 2) Update METAL_API_KEY in .env. 3) Add ?test=1 to this URL to diagnose.',
        'test_url' => '?key=' . rawurlencode($providedKey) . '&test=1',
    ], JSON_PRETTY_PRINT);
    exit;
}

$rates = $service->getRates();
$count = count($rates['data'] ?? []);

if ($count === 0) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Rates fetch ran but no prices were saved',
        'detail' => $service->getLastError(),
        'fix' => 'Try ?test=1 on this URL to see the raw API response.',
    ], JSON_PRETTY_PRINT);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Metal rates updated',
    'count' => $count,
    'data' => $rates['data'] ?? [],
], JSON_PRETTY_PRINT);
