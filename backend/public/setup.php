<?php

/**
 * One-time browser setup for cPanel (no SSH required).
 * Visit: https://api.yourdomain.co.uk/setup.php?key=YOUR_SETUP_SECRET
 * Delete this file after setup completes.
 */

declare(strict_types=1);

$lockFile = __DIR__ . '/../storage/app/installed.lock';

function setup_response(int $code, string $title, string $body, bool $success = false): never
{
    http_response_code($code);
    $badge = $success ? '#c9a84c' : '#ef5350';
    echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$title} — Fine Jewellery Buyers Setup</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 0; padding: 32px 16px; }
    .box { max-width: 640px; margin: 0 auto; background: #111; border: 1px solid #333; border-radius: 8px; padding: 24px; }
    h1 { margin: 0 0 8px; font-size: 1.4rem; }
    .badge { display: inline-block; background: {$badge}; color: #000; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; }
    pre { background: #000; border: 1px solid #333; padding: 12px; overflow: auto; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
    ul { line-height: 1.7; color: #ccc; }
    a { color: #c9a84c; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge">SETUP</div>
    <h1>{$title}</h1>
    {$body}
  </div>
</body>
</html>
HTML;
    exit;
}

if (is_file($lockFile)) {
    setup_response(403, 'Already installed', '<p>Setup has already completed. Delete <code>storage/app/installed.lock</code> only if you need to run setup again.</p><p>For security, delete <code>public/setup.php</code> from your server.</p>');
}

if (!is_file(__DIR__ . '/../vendor/autoload.php')) {
    setup_response(500, 'Missing vendor folder', '<p>Upload the <code>vendor/</code> folder before running setup.</p><p>On your computer run <code>composer install --no-dev</code> inside <code>backend/</code>, zip the <code>vendor</code> folder, and upload it via cPanel File Manager.</p>');
}

if (!is_file(__DIR__ . '/../.env')) {
    setup_response(500, 'Missing .env file', '<p>Create <code>.env</code> on the server (copy from <code>.env.example</code>) and set your database credentials, <code>APP_URL</code>, <code>FRONTEND_URL</code>, and <code>SETUP_SECRET</code>.</p>');
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$providedKey = (string) ($_GET['key'] ?? '');
$expectedKey = (string) env('SETUP_SECRET', '');

if ($expectedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    setup_response(403, 'Invalid setup key', '<p>Add <code>SETUP_SECRET=your-long-random-string</code> to <code>.env</code>, then open:</p><pre>https://api.yourdomain.co.uk/setup.php?key=your-long-random-string</pre>');
}

use Illuminate\Support\Facades\Artisan;

$steps = [];
$errors = [];

try {
    if (empty(env('APP_KEY'))) {
        Artisan::call('key:generate', ['--force' => true]);
        $steps[] = 'Generated APP_KEY';
    } else {
        $steps[] = 'APP_KEY already set';
    }

    Artisan::call('migrate', ['--force' => true]);
    $steps[] = 'Database migrations: OK';
    $steps[] = trim(Artisan::output()) ?: 'Migrations finished';

    Artisan::call('db:seed', ['--force' => true]);
    $steps[] = 'Database seeders: OK';

    @mkdir(__DIR__ . '/uploads/blog', 0775, true);
    @mkdir(__DIR__ . '/uploads/team', 0775, true);
    $steps[] = 'Upload folders ready';

    Artisan::call('config:cache');
    Artisan::call('route:cache');
    $steps[] = 'Config and routes cached';

    Artisan::call('rates:fetch');
    $steps[] = 'Initial metal rates fetched';

    file_put_contents($lockFile, date('c') . PHP_EOL);
    $steps[] = 'Install lock created';
} catch (Throwable $e) {
    $errors[] = $e->getMessage();
}

if ($errors) {
    $log = htmlspecialchars(implode("\n", array_merge($steps, $errors)), ENT_QUOTES, 'UTF-8');
    setup_response(500, 'Setup failed', "<pre>{$log}</pre><p>Fix the issue above, then reload this page.</p>");
}

$log = htmlspecialchars(implode("\n", $steps), ENT_QUOTES, 'UTF-8');
$apiUrl = htmlspecialchars(rtrim((string) env('APP_URL', ''), '/'), ENT_QUOTES, 'UTF-8');
$cronSecret = htmlspecialchars((string) env('CRON_SECRET', ''), ENT_QUOTES, 'UTF-8');
$cronUrl = $cronSecret !== '' ? "{$apiUrl}/api/cron?key={$cronSecret}" : "{$apiUrl}/api/cron?key=YOUR_CRON_SECRET";

setup_response(
    200,
    'Setup complete',
    "<p>Your API is ready.</p><pre>{$log}</pre>
    <p><strong>Test API:</strong> <a href=\"{$apiUrl}/api/rates\" target=\"_blank\">{$apiUrl}/api/rates</a></p>
    <p><strong>Admin login:</strong> admin@finejewellerybuyers.co.uk / admin123 — change this immediately.</p>
    <h2>Next steps (no SSH)</h2>
    <ul>
      <li>Delete <code>public/setup.php</code> from the server.</li>
      <li>In cPanel → Cron Jobs, add every minute:<br><code>curl -s \"{$cronUrl}\"</code></li>
      <li>Deploy frontend on Vercel with <code>NEXT_PUBLIC_API_URL={$apiUrl}</code></li>
    </ul>",
    true
);
