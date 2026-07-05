<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class CronController extends Controller
{
    /**
     * Run scheduled tasks via URL (for cPanel cron without SSH).
     * Example: curl -s "https://api.example.com/api/cron?key=YOUR_CRON_SECRET"
     */
    public function run(Request $request): JsonResponse
    {
        $secret = (string) config('services.cron_secret', '');
        $key = (string) $request->query('key', '');

        if ($secret === '' || !hash_equals($secret, $key)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        Artisan::call('schedule:run');

        return response()->json([
            'ok' => true,
            'ran_at' => now()->toIso8601String(),
            'output' => trim(Artisan::output()) ?: 'schedule:run completed',
        ]);
    }

    /**
     * Fetch metal rates immediately (after API key is configured).
     */
    public function fetchRates(Request $request): JsonResponse
    {
        $secret = (string) config('services.cron_secret', '');
        $key = (string) $request->query('key', '');

        if ($secret === '' || !hash_equals($secret, $key)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        Artisan::call('rates:fetch');

        $service = app(\App\Services\MetalRateService::class);
        $rates = $service->getRates();

        return response()->json([
            'ok' => true,
            'output' => trim(Artisan::output()),
            'count' => count($rates['data'] ?? []),
            'data' => $rates['data'] ?? [],
        ]);
    }
}
