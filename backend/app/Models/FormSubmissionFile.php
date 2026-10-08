<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmissionFile extends Model
{
    protected $fillable = [
        'form_submission_id',
        'form_submission_message_id',
        'field_name',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'form_submission_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(FormSubmissionMessage::class, 'form_submission_message_id');
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type ?? '', 'image/');
    }

    public function isPdf(): bool
    {
        $mime = strtolower($this->mime_type ?? '');
        $name = strtolower($this->original_name ?? '');

        return str_contains($mime, 'pdf') || str_ends_with($name, '.pdf');
    }

    public function publicUrl(): string
    {
        return rtrim(config('app.url'), '/') . '/api/submission-files/' . $this->id;
    }
}
