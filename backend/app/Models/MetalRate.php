<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetalRate extends Model
{
    protected $fillable = [
        'metal', 'purity', 'label', 'market_price_per_gram', 'market_price_per_oz',
        'buying_percentage', 'change_24h', 'currency', 'sort_order', 'is_active', 'rate_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'market_price_per_gram' => 'decimal:4',
            'market_price_per_oz' => 'decimal:4',
            'buying_percentage' => 'decimal:2',
            'change_24h' => 'decimal:4',
            'is_active' => 'boolean',
            'rate_updated_at' => 'datetime',
        ];
    }

    public function getBuyingPricePerGramAttribute(): float
    {
        return round($this->market_price_per_gram * ($this->buying_percentage / 100), 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByMetal($query, string $metal)
    {
        return $query->where('metal', $metal);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
