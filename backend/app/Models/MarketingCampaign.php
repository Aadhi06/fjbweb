<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingCampaign extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'body_html',
        'status',
        'audience',
        'filter_tags',
        'total_recipients',
        'sent_count',
        'failed_count',
        'created_by',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'filter_tags' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(MarketingCampaignRecipient::class, 'campaign_id');
    }
}
