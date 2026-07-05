<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingContact extends Model
{
    protected $fillable = [
        'email',
        'name',
        'phone',
        'tags',
        'sources',
        'metadata',
        'is_subscribed',
        'consent_at',
        'first_seen_at',
        'last_seen_at',
        'last_contacted_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'sources' => 'array',
            'metadata' => 'array',
            'is_subscribed' => 'boolean',
            'consent_at' => 'datetime',
            'first_seen_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'last_contacted_at' => 'datetime',
        ];
    }

    public function campaignRecipients(): HasMany
    {
        return $this->hasMany(MarketingCampaignRecipient::class, 'contact_id');
    }

    public function scopeSubscribed($query)
    {
        return $query->where('is_subscribed', true);
    }
}
