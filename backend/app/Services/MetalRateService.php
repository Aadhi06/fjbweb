<?php

namespace App\Services;

use App\Models\MetalRate;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetalRateService
{
    private const GOLD_PURITIES = [
        ['purity' => '9ct',  'label' => 'Gold 9ct',  'factor' => 0.375],
        ['purity' => '18ct', 'label' => 'Gold 18ct', 'factor' => 0.750],
        ['purity' => '22ct', 'label' => 'Gold 22ct', 'factor' => 0.9167],
        ['purity' => '24ct', 'label' => 'Gold 24ct', 'factor' => 0.999],
    ];

    public function fetchAndUpdateRates(): bool
    {
        $apiKey = Setting::get('metal_api_key', config('services.metalpriceapi.key'));
        $apiProvider = Setting::get('metal_api_provider', 'metalpriceapi');

        if (!$apiKey) {
            Log::warning('Metal price API key not configured');
            return false;
        }

        try {
            if ($apiProvider === 'goldapi') {
                return $this->fetchFromGoldApi($apiKey);
            }

            return $this->fetchFromMetalPriceApi($apiKey);
        } catch (\Exception $e) {
            Log::error('Failed to fetch metal rates: ' . $e->getMessage());
            return false;
        }
    }

    private function fetchFromMetalPriceApi(string $apiKey): bool
    {
        $response = Http::withHeaders([
            'X-API-KEY' => $apiKey,
        ])->get('https://api.metalpriceapi.com/v1/latest', [
            'api_key' => $apiKey,
            'base' => 'GBP',
            'currencies' => 'XAU,XAG',
        ]);

        if (!$response->successful()) {
            Log::error('MetalPriceAPI error: ' . $response->body());
            return false;
        }

        $data = $response->json();
        $rates = $data['rates'] ?? [];

        $metals = [
            'XAU' => 'gold',
            'XAG' => 'silver',
        ];

        foreach ($metals as $symbol => $name) {
            $directKey = "GBP{$symbol}";
            $inverseKey = $symbol;

            if (isset($rates[$directKey]) && $rates[$directKey] > 1) {
                $pricePerOz = $rates[$directKey];
            } elseif (isset($rates[$inverseKey]) && $rates[$inverseKey] > 0) {
                $pricePerOz = 1 / $rates[$inverseKey];
            } else {
                continue;
            }

            $pricePerGram = $pricePerOz / 31.1035;
            $this->updateMetalRates($name, $pricePerOz, $pricePerGram, 0);
        }

        Cache::forget('metal_rates');
        return true;
    }

    private function fetchFromGoldApi(string $apiKey): bool
    {
        $apiUrl = Setting::get('goldapi_url', 'https://www.goldapi.io/api');
        $metals = ['XAU' => 'gold', 'XAG' => 'silver'];

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
        $buyingPercentage = (float) Setting::get('buying_percentage', 95);

        if ($metal === 'gold') {
            foreach (self::GOLD_PURITIES as $i => $p) {
                MetalRate::updateOrCreate(
                    ['metal' => $metal, 'purity' => $p['purity']],
                    [
                        'label' => $p['label'],
                        'market_price_per_gram' => round($pricePerGram * $p['factor'], 4),
                        'market_price_per_oz' => round($pricePerOz * $p['factor'], 4),
                        'buying_percentage' => $buyingPercentage,
                        'change_24h' => round($changePercent, 4),
                        'sort_order' => $i,
                        'rate_updated_at' => now(),
                    ]
                );
            }
        } else {
            MetalRate::updateOrCreate(
                ['metal' => $metal, 'purity' => '999'],
                [
                    'label' => 'Silver',
                    'market_price_per_gram' => round($pricePerGram, 4),
                    'market_price_per_oz' => round($pricePerOz, 4),
                    'buying_percentage' => $buyingPercentage,
                    'change_24h' => round($changePercent, 4),
                    'sort_order' => 10,
                    'rate_updated_at' => now(),
                ]
            );
        }
    }

    public function getRates(): array
    {
        $this->refreshRatesIfStale();

        return Cache::remember('metal_rates', 25, function () {
            $rates = MetalRate::active()
                ->whereIn('metal', ['gold', 'silver'])
                ->ordered()
                ->get();

            $data = $rates->map(function ($rate) {
                return [
                    'metal' => $rate->label,
                    'price_per_gram' => (float) $rate->market_price_per_gram,
                    'buying_price_per_gram' => $rate->buying_price_per_gram,
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
        return match ($carat) {
            '9ct' => 0.375,
            '18ct' => 0.750,
            '22ct' => 0.9167,
            '24ct' => 0.999,
            default => 1.0,
        };
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
