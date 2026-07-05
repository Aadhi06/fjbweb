<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualReview extends Model
{
    protected $fillable = [
        'name', 'rating', 'text', 'review_date', 'photo_url', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'review_date' => 'date',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
