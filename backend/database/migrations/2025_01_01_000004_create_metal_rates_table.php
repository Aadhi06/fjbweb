<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metal_rates', function (Blueprint $table) {
            $table->id();
            $table->string('metal'); // gold, silver, platinum, palladium
            $table->string('purity'); // 9ct, 14ct, 18ct, 22ct, 24ct, 925, 950, 999
            $table->string('label'); // "9ct Gold (375)"
            $table->decimal('market_price_per_gram', 12, 4);
            $table->decimal('market_price_per_oz', 12, 4)->nullable();
            $table->decimal('buying_percentage', 5, 2)->default(92.00);
            $table->decimal('change_24h', 8, 4)->default(0);
            $table->string('currency', 3)->default('GBP');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('rate_updated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metal_rates');
    }
};
