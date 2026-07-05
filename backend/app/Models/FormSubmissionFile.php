<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmissionFile extends Model
{
    protected $fillable = [
        'form_submission_id', 'field_name', 'original_name', 'file_path', 'mime_type', 'file_size',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'form_submission_id');
    }
}
