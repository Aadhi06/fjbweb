<?php

namespace App\Services;

use App\Models\MetalRate;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetalRateService
{
    private static ?string $lastError = null;

    private const GOLD_PURITIES = [
        ['purity' => '9ct',  'label' => 'Gold 9ct',  'factor' => 9 / 24],
        ['purity' => '10ct', 'label' => 'Gold 10ct', 'factor' => 10 / 24],
        ['purity' => '14ct', 'label' => 'Gold 14ct', 'factor' => 14 / 24],
        ['purity' => '18ct', 'label' => 'Gold 18ct', 'factor' => 18 / 24],
        ['purity' => '21ct', 'label' => 'Gold 21ct', 'factor' => 21 / 24],
        ['purity' => '22ct', 'label' => 'Gold 22ct', 'factor' => 22 / 24],
        ['purity' => '24ct', 'label' => 'Gold 24ct', 'factor' => 0.999],
    ];

    private const SPOT_METALS = [
        'XAU' => 'gold',
        'XAG' => 'silver',
        'XPT' => 'platinum',
        'XPD' => 'palladium',
    ];

    public function getLastError(): ?string
    {
        return self::$lastError;
    }

    public function fetchAndUpdateRates(?string $apiKeyOverride = null): bool
    {
        self::$lastError = null;

        $apiKey = $apiKeyOverride
            ?: Setting::get('metal_api_key')
            ?: config('services.metalpriceapi.key');

        $apiProvider = Setting::get('metal_api_provider', 'metalpriceapi');

        if (!$apiKey) {
            self::$lastError = 'Metal price API key not configured';
            Log::warning(self::$lastError);
            return false;
        }

        try {
            if ($apiProvider === 'goldapi') {
                return $this->fetchFromGoldApi($apiKey);
            }

            return $this->fetchFromMetalPriceApi($apiKey);
        } catch (\Exception $e) {
            self::$lastError = $e->getMessage();
            Log::error('Failed to fetch metal rates: ' . $e->getMessage());
            return false;
        }
    }

    public function testMetalPriceApi(string $apiKey): array
    {
        $response = $this->requestMetalPriceApi($apiKey, 'USD', 'XAU,XAG,GBP');

        if (!$response) {
            return [
                'ok' => false,
                'error' => self::$lastError ?? 'Request failed',
            ];
        }

        return [
            'ok' => (bool) ($response['success'] ?? false),
            'base' => $response['base'] ?? null,
            'rates_keys' => array_keys($response['rates'] ?? []),
            'error' => $response['error'] ?? $response['message'] ?? null,
        ];
    }

    private function requestMetalPriceApi(string $apiKey, string $base, string $currencies): ?array
    {
        $url = 'https://api.metalpriceapi.com/v1/latest?' . http_build_query([
            'api_key' => $apiKey,
            'base' => $base,
            'currencies' => $currencies,
        ]);

        try {
            $response = Http::timeout(30)->withHeaders([
                'X-API-KEY' => $apiKey,
            ])->get($url);

            if ($response->successful()) {
                return $response->json();
            }

            self::$lastError = 'HTTP ' . $response->status() . ': ' . $response->body();
        } catch (\Exception $e) {
            self::$lastError = 'HTTP client error: ' . $e->getMessage();
        }

        $raw = $this->requestMetalPriceApiViaStream($url);

        return $raw;
    }

    private function requestMetalPriceApiViaStream(string $url): ?array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 30,
                'ignore_errors' => true,
                'header' => "Accept: application/json\r\n",
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);

        $body = @file_get_contents($url, false, $context);

        if ($body === false) {
            self::$lastError = (self::$lastError ? self::$lastError . ' | ' : '')
                . 'Stream request failed — Hostinger may block outbound HTTPS';
            return null;
        }

        $decoded = json_decode($body, true);

        if (!is_array($decoded)) {
            self::$lastError = 'Invalid JSON from MetalPriceAPI';
            return null;
        }

        return $decoded;
    }

    private function fetchFromMetalPriceApi(string $apiKey): bool
    {
        $data = $this->requestMetalPriceApi($apiKey, 'GBP', 'XAU,XAG,XPT,XPD');

        if (!$data) {
            return $this->fetchFromMetalPriceApiUsd($apiKey);
        }

        if (!($data['success'] ?? false)) {
            self::$lastError = 'MetalPriceAPI GBP: ' . json_encode($data['error'] ?? $data);
            Log::error(self::$lastError);
            return $this->fetchFromMetalPriceApiUsd($apiKey);
        }

        $updated = $this->storeRatesFromApiResponse($data['rates'] ?? [], strtoupper($data['base'] ?? 'GBP'));

        if ($updated === 0) {
            return $this->fetchFromMetalPriceApiUsd($apiKey);
        }

        Cache::forget('metal_rates');
        return true;
    }

    private function fetchFromMetalPriceApiUsd(string $apiKey): bool
    {
        $data = $this->requestMetalPriceApi($apiKey, 'USD', 'XAU,XAG,XPT,XPD,GBP');

        if (!$data) {
            return false;
        }

        if (!($data['success'] ?? false)) {
            self::$lastError = 'MetalPriceAPI USD: ' . json_encode($data['error'] ?? $data);
            Log::error(self::$lastError);
            return false;
        }

        $rates = $data['rates'] ?? [];
        $gbpPerUsd = (float) ($rates['GBP'] ?? 0);

        if ($gbpPerUsd <= 0) {
            Log::error('MetalPriceAPI USD fallback: GBP rate missing');
            return false;
        }

        $updated = 0;

        foreach (self::SPOT_METALS as $symbol => $name) {
            $pricePerOzUsd = $this->extractMetalPricePerOz($rates, 'USD', $symbol);

            if ($pricePerOzUsd === null || $pricePerOzUsd <= 0) {
                continue;
            }

            $pricePerOz = $pricePerOzUsd * $gbpPerUsd;
            $pricePerGram = $pricePerOz / 31.1035;
            $this->updateMetalRates($name, $pricePerOz, $pricePerGram, 0);
            $updated++;
        }

        if ($updated === 0) {
            Log::error('MetalPriceAPI: no metal prices parsed from response');
            return false;
        }

        Cache::forget('metal_rates');
        return true;
    }

    private function storeRatesFromApiResponse(array $rates, string $base): int
    {
        $updated = 0;

        foreach (self::SPOT_METALS as $symbol => $name) {
            $pricePerOz = $this->extractMetalPricePerOz($rates, $base, $symbol);

            if ($pricePerOz === null || $pricePerOz <= 0) {
                continue;
            }

            $pricePerGram = $pricePerOz / 31.1035;
            $this->updateMetalRates($name, $pricePerOz, $pricePerGram, 0);
            $updated++;
        }

        return $updated;
    }

    private function extractMetalPricePerOz(array $rates, string $base, string $symbol): ?float
    {
        $directKey = $base . $symbol;

        if (isset($rates[$directKey]) && is_numeric($rates[$directKey]) && (float) $rates[$directKey] > 0) {
            return (float) $rates[$directKey];
        }

        if (isset($rates[$symbol]) && is_numeric($rates[$symbol]) && (float) $rates[$symbol] > 0) {
            return 1 / (float) $rates[$symbol];
        }

        return null;
    }

    private function fetchFromGoldApi(string $apiKey): bool
    {
        $apiUrl = Setting::get('goldapi_url', 'https://www.goldapi.io/api');
        $metals = self::SPOT_METALS;

        foreach ($metals as $symbol => $name) {
            $response = Http::withHeaders([
                'x-access-token' => $apiKey,
            ])->get("{$apiUrl}/{$symbol}/GBP");

            if ($response->successful()) {
                $data = $response->json();
                $pricePerOz = $data['price'] ?? 0;
                $pricePerGram = $pricePerOz / 31.1035;
                $change = $data['ch'] ?? 0;
                $changePercent = $pricePerOz > 0 ? ($change / ($pricePerOz - $change)) * 100 : 0;

                $this->updateMetalRates($name, $pricePerOz, $pricePerGram, $changePercent);
            }

            usleep(500000);
        }

        Cache::forget('metal_rates');
        return true;
    }

    private function updateMetalRates(string $metal, float $pricePerOz, float $pricePerGram, float $changePercent): void
    {
        if ($metal === 'gold') {
            foreach (self::GOLD_PURITIES as $i => $p) {
                MetalRate::updateOrCreate(
                    ['metal' => $metal, 'purity' => $p['purity']],
                    [
                        'label' => $p['label'],
                        'market_price_per_gram' => round($pricePerGram * $p['factor'], 4),
                        'market_price_per_oz' => round($pricePerOz * $p['factor'], 4),
                        'buying_percentage' => $this->resolveBuyingPercentage($metal, $p['purity']),
                        'change_24h' => round($changePercent, 4),
                        'sort_order' => $i,
                        'rate_updated_at' => now(),
                    ]
                );
            }

            return;
        }

        $purity = '999';
        $label = match ($metal) {
            'palladium' => 'Palladium',
            'platinum' => 'Platinum',
            default => 'Silver',
        };
        $sortOrder = match ($metal) {
            'platinum' => 10,
            'palladium' => 11,
            default => 9,
        };

        MetalRate::updateOrCreate(
            ['metal' => $metal, 'purity' => $purity],
            [
                'label' => $label,
                'market_price_per_gram' => round($pricePerGram, 4),
                'market_price_per_oz' => round($pricePerOz, 4),
                'buying_percentage' => $this->resolveBuyingPercentage($metal, $purity),
                'change_24h' => round($changePercent, 4),
                'sort_order' => $sortOrder,
                'rate_updated_at' => now(),
            ]
        );
    }

    private function resolveBuyingPercentage(string $metal, string $purity): float
    {
        $existing = MetalRate::where('metal', $metal)->where('purity', $purity)->value('buying_percentage');

        if ($existing !== null) {
            return (float) $existing;
        }

        return (float) Setting::get('buying_percentage', 85);
    }

    public function getRates(): array
    {
        $this->refreshRatesIfStale();

        return Cache::remember('metal_rates', 25, function () {
            $rates = MetalRate::active()
                ->whereIn('metal', ['gold', 'silver', 'platinum', 'palladium'])
                ->ordered()
                ->get();

            $data = $rates->map(function ($rate) {
                return [
                    'metal' => $rate->label,
                    'metal_type' => $rate->metal,
                    'purity' => $rate->purity,
                    'price_per_gram' => (float) $rate->market_price_per_gram,
                    'buying_price_per_gram' => $rate->buying_price_per_gram,
                    'buying_percentage' => (float) $rate->buying_percentage,
                    'price_per_oz' => (float) $rate->market_price_per_oz,
                    'change_24h' => (float) $rate->change_24h,
                    'currency' => $rate->currency,
                    'updated_at' => $rate->rate_updated_at?->toIso8601String(),
                ];
            })->toArray();

            $goldCarats = $rates->where('metal', 'gold')->map(function ($rate) {
                return [
                    'carat' => $rate->purity,
                    'label' => $rate->label,
                    'purity' => $this->caratToPurity($rate->purity),
                    'price_per_gram' => (float) $rate->market_price_per_gram,
                    'buying_price_per_gram' => $rate->buying_price_per_gram,
                ];
            })->values()->toArray();

            return [
                'data' => $data,
                'gold_carats' => $goldCarats,
            ];
        });
    }

    private function refreshRatesIfStale(): void
    {
        $latest = MetalRate::active()->max('rate_updated_at');

        if ($latest && now()->subSeconds(30)->lt($latest)) {
            return;
        }

        Cache::lock('metal_rates_fetch', 25)->get(function () {
            $latest = MetalRate::active()->max('rate_updated_at');

            if ($latest && now()->subSeconds(30)->lt($latest)) {
                return;
            }

            if ($this->fetchAndUpdateRates()) {
                Cache::forget('metal_rates');
            }
        });
    }

    private function caratToPurity(string $carat): float
    {
        if (preg_match('/^(\d+)ct$/', $carat, $m)) {
            return min(((int) $m[1]) / 24, 0.999);
        }

        return match ($carat) {
            '9ct' => 9 / 24,
            '10ct' => 10 / 24,
            '14ct' => 14 / 24,
            '18ct' => 18 / 24,
            '21ct' => 21 / 24,
            '22ct' => 22 / 24,
            '24ct' => 0.999,
            default => 1.0,
        };
    }

    public function getAdminRates(): array
    {
        return MetalRate::ordered()->get()->map(fn (MetalRate $rate) => [
            'id' => $rate->id,
            'metal' => $rate->metal,
            'purity' => $rate->purity,
            'label' => $rate->label,
            'market_price_per_gram' => (float) $rate->market_price_per_gram,
            'buying_percentage' => (float) $rate->buying_percentage,
            'buying_price_per_gram' => $rate->buying_price_per_gram,
            'is_active' => $rate->is_active,
        ])->all();
    }

    public function updateBuyingPercentages(array $rates): void
    {
        foreach ($rates as $row) {
            MetalRate::where('id', $row['id'])->update([
                'buying_percentage' => $row['buying_percentage'],
            ]);
        }

        Cache::forget('metal_rates');
    }

    public function calculate(float $weight, string $carat): array
    {
        $rate = MetalRate::where('metal', 'gold')->where('purity', $carat)->first();

        if (!$rate) {
            return ['error' => 'Carat not found'];
        }

        $marketValue = $rate->market_price_per_gram * $weight;
        $buyingValue = $rate->buying_price_per_gram * $weight;

        return [
            'rate_per_gram' => $rate->buying_price_per_gram,
            'market_value' => round($marketValue, 2),
            'buying_value' => round($buyingValue, 2),
        ];
    }
}
