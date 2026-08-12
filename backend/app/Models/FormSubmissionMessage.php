<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class FormSubmissionMessage extends Model
{
    protected $fillable = [
        'form_submission_id',
        'sender',
        'body',
        'admin_user_id',
        'open_token',
        'email_opened_at',
        'page_viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'email_opened_at' => 'datetime',
            'page_viewed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (FormSubmissionMessage $message) {
            if ($message->sender === 'admin' && !$message->open_token) {
                $message->open_token = Str::random(48);
            }
        });
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'form_submission_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function markEmailOpened(): void
    {
        if (!$this->email_opened_at) {
            $this->forceFill(['email_opened_at' => now()])->save();
        }
    }

    public function markPageViewed(): void
    {
        if (!$this->page_viewed_at) {
            $this->forceFill(['page_viewed_at' => now()])->save();
        }
        // Opening the chat page also means they saw the email/message thread.
        $this->markEmailOpened();
    }
}
