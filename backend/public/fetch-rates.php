<?php

/**
 * Fetch live metal rates via browser (no SSH).
 * https://api.yourdomain.co.uk/fetch-rates.php?key=YOUR_CRON_SECRET
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

$apiKey = \App\Models\Setting::get('metal_api_key', hostinger_env('METAL_API_KEY'));

if (!$apiKey) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Metal API key not configured',
        'fix' => 'Add METAL_API_KEY=your_key to .env, then reload this page.',
    ]);
    exit;
}

// Ensure fetch uses the key even when config cache is stale
if (!\App\Models\Setting::get('metal_api_key')) {
    \App\Models\Setting::set('metal_api_key', $apiKey, 'text', 'api', 'Metal API Key');
}

$service = app(\App\Services\MetalRateService::class);
$ok = $service->fetchAndUpdateRates();

if (!$ok) {
    http_response_code(500);
    echo json_encode(['error' => 'Fetch failed — check METAL_API_KEY is valid at metalpriceapi.com']);
    exit;
}

$rates = $service->getRates();
$count = count($rates['data'] ?? []);

if ($count === 0) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Rates fetch ran but no prices were saved',
        'fix' => 'Check METAL_API_KEY is valid at metalpriceapi.com. Free plan must allow GBP or USD rates.',
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Metal rates updated',
    'count' => count($rates['data'] ?? []),
    'data' => $rates['data'] ?? [],
], JSON_PRETTY_PRINT);
