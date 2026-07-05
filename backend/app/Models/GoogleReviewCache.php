<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleReviewCache extends Model
{
    protected $table = 'google_reviews_cache';

    protected $fillable = [
        'place_id', 'place_name', 'rating', 'total_reviews', 'reviews', 'fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:2',
            'reviews' => 'array',
            'fetched_at' => 'datetime',
        ];
    }
}
