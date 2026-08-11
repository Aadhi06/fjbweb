<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewModeration extends Model
{
    protected $fillable = [
        'review_key',
        'author_name',
        'rating',
        'is_hidden',
        'reply_text',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'is_hidden' => 'boolean',
            'rating' => 'integer',
            'replied_at' => 'datetime',
        ];
    }

    public static function makeKey(string $authorName, int|string|null $time, string $text = ''): string
    {
        return hash('sha256', strtolower(trim($authorName)) . '|' . (string) ($time ?? 0) . '|' . mb_substr(trim($text), 0, 80));
    }
}
