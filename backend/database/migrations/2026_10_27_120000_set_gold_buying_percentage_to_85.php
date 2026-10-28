<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('metal_rates')->where('metal', 'gold')->update([
            'buying_percentage' => 85,
        ]);

        Setting::set('buying_percentage', 85, 'number', 'api', 'Buying Percentage');
        Cache::forget('metal_rates');
    }

    public function down(): void
    {
        DB::table('metal_rates')->where('metal', 'gold')->update([
            'buying_percentage' => 86,
        ]);

        Setting::set('buying_percentage', 86, 'number', 'api', 'Buying Percentage');
        Cache::forget('metal_rates');
    }
};
