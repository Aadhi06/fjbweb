<?php

use App\Models\MetalRate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const NEW_GOLD_CARATS = [
        ['purity' => '10ct', 'label' => 'Gold 10ct', 'factor' => 10 / 24, 'sort_order' => 1],
        ['purity' => '14ct', 'label' => 'Gold 14ct', 'factor' => 14 / 24, 'sort_order' => 2],
        ['purity' => '21ct', 'label' => 'Gold 21ct', 'factor' => 21 / 24, 'sort_order' => 5],
    ];

    public function up(): void
    {
        $base24 = MetalRate::where('metal', 'gold')->where('purity', '24ct')->first();
        $baseGram = $base24
            ? (float) $base24->market_price_per_gram / 0.999
            : 100.0;
        $baseOz = $base24
            ? (float) $base24->market_price_per_oz / 0.999
            : 3120.0;
        $defaultPct = (float) (MetalRate::value('buying_percentage') ?? 85);

        foreach (self::NEW_GOLD_CARATS as $carat) {
            MetalRate::updateOrCreate(
                ['metal' => 'gold', 'purity' => $carat['purity']],
                [
                    'label' => $carat['label'],
                    'market_price_per_gram' => round($baseGram * $carat['factor'], 4),
                    'market_price_per_oz' => round($baseOz * $carat['factor'], 4),
                    'buying_percentage' => $defaultPct,
                    'change_24h' => 0,
                    'currency' => 'GBP',
                    'sort_order' => $carat['sort_order'],
                    'is_active' => true,
                    'rate_updated_at' => now(),
                ]
            );
        }

        $reorder = [
            '9ct' => 0,
            '10ct' => 1,
            '14ct' => 2,
            '18ct' => 3,
            '21ct' => 4,
            '22ct' => 5,
            '24ct' => 6,
        ];

        foreach ($reorder as $purity => $order) {
            MetalRate::where('metal', 'gold')->where('purity', $purity)->update(['sort_order' => $order]);
        }

        MetalRate::updateOrCreate(
            ['metal' => 'palladium', 'purity' => '999'],
            [
                'label' => 'Palladium',
                'market_price_per_gram' => 30.0,
                'market_price_per_oz' => 930.0,
                'buying_percentage' => $defaultPct,
                'change_24h' => 0,
                'currency' => 'GBP',
                'sort_order' => 11,
                'is_active' => true,
                'rate_updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        MetalRate::where('metal', 'gold')->whereIn('purity', ['10ct', '14ct', '21ct'])->delete();
        MetalRate::where('metal', 'palladium')->delete();
    }
};
