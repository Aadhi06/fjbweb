<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_id', 'data', 'ip_address', 'user_agent', 'status', 'admin_notes', 'reply_token', 'admin_last_read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'admin_last_read_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (FormSubmission $submission) {
            if (!$submission->reply_token) {
                $submission->reply_token = Str::random(48);
            }
        });
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(FormSubmissionFile::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(FormSubmissionMessage::class)->orderBy('created_at');
    }
}
