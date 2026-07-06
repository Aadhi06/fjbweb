<?php

/**
 * Run Laravel migrations on Hostinger (no SSH).
 * Visit once: https://api.finejewellerybuyers.co.uk/run-migrate.php?key=YOUR_CRON_SECRET
 * Delete this file after use.
 */

declare(strict_types=1);

require __DIR__ . '/hostinger-env.php';

function migrate_response(int $code, string $title, string $body, bool $success = false): never
{
    http_response_code($code);
    $badge = $success ? '#c9a84c' : '#ef5350';
    echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{$title} — Fine Jewellery Buyers</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 0; padding: 32px 16px; }
    .box { max-width: 720px; margin: 0 auto; background: #111; border: 1px solid #333; border-radius: 8px; padding: 24px; }
    h1 { margin: 0 0 8px; font-size: 1.4rem; }
    .badge { display: inline-block; background: {$badge}; color: #000; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; }
    pre { background: #000; border: 1px solid #333; padding: 12px; overflow: auto; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
    code { color: #c9a84c; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge">MIGRATE</div>
    <h1>{$title}</h1>
    {$body}
  </div>
</body>
</html>
HTML;
    exit;
}

$key = (string) ($_GET['key'] ?? '');
$secret = hostinger_env('CRON_SECRET');

if ($secret === '' || !hash_equals($secret, $key)) {
    migrate_response(
        403,
        'Invalid key',
        '<p>Add your secret to the URL:</p><pre>https://api.finejewellerybuyers.co.uk/run-migrate.php?key=YOUR_CRON_SECRET</pre><p>Use the same <code>CRON_SECRET</code> value from your <code>.env</code> file.</p>'
    );
}

if (!is_file(__DIR__ . '/../vendor/autoload.php')) {
    migrate_response(500, 'Missing vendor folder', '<p>Upload the <code>vendor/</code> folder before running migrations.</p>');
}

if (!is_file(__DIR__ . '/../.env')) {
    migrate_response(500, 'Missing .env file', '<p>Create <code>.env</code> on the server before running migrations.</p>');
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Artisan;

$steps = [];

try {
    Artisan::call('migrate', ['--force' => true]);
    $output = trim(Artisan::output());
    $steps[] = $output !== '' ? $output : 'All migrations are up to date.';
} catch (Throwable $e) {
    $log = htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
    migrate_response(500, 'Migration failed', "<pre>{$log}</pre><p>Fix the error, upload any missing migration files, then reload this page.</p>");
}

$log = htmlspecialchars(implode("\n", $steps), ENT_QUOTES, 'UTF-8');

migrate_response(
    200,
    'Migrations complete',
    "<p>Database migrations finished successfully.</p>
    <pre>{$log}</pre>
    <p>This run includes the gold calculator photo upload field (<code>add_photos_to_gold_valuation_form</code>).</p>
    <p><strong>Delete</strong> <code>public/run-migrate.php</code> from the server when done.</p>",
    true
);
