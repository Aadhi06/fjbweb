<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSetting extends Model
{
    protected $fillable = [
        'day_of_week',
        'is_open',
        'open_time',
        'close_time',
        'slot_duration_minutes',
        'max_bookings_per_slot',
    ];

    protected function casts(): array
    {
        return [
            'is_open' => 'boolean',
            'slot_duration_minutes' => 'integer',
            'max_bookings_per_slot' => 'integer',
        ];
    }
}
