<?php

namespace App\Services;

use App\Mail\AdminFormNotification;
use App\Mail\CustomerFormConfirmation;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\FormSubmissionFile;
use App\Models\Setting;
use App\Services\MarketingContactService;
use App\Services\MailConfigService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FormSubmissionService
{
    public function submit(Form $form, Request $request): FormSubmission
    {
        $fields = $form->activeFields;
        $data = [];
        $files = [];

        foreach ($fields as $field) {
            if ($field->type === 'file') {
                if ($request->hasFile($field->name)) {
                    $uploadedFiles = $request->file($field->name);
                    $uploadedFiles = is_array($uploadedFiles) ? $uploadedFiles : [$uploadedFiles];
                    foreach ($uploadedFiles as $file) {
                        $files[] = [
                            'field_name' => $field->name,
                            'file' => $file,
                        ];
                    }
                    $data[$field->name] = count($uploadedFiles) . ' file(s) uploaded';
                }
            } else {
                $data[$field->name] = $request->input($field->name);
            }
        }

        $systemFields = ['_honeypot', '_loaded_at', 'website_url', '_token'];
        $fieldNames = $fields->pluck('name')->toArray();
        foreach ($request->except(array_merge($systemFields, $fieldNames)) as $key => $value) {
            if (!str_starts_with($key, '_') && !is_null($value)) {
                $data[$key] = $value;
            }
        }

        $submission = FormSubmission::create([
            'form_id' => $form->id,
            'data' => $data,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'new',
        ]);

        foreach ($files as $fileData) {
            $file = $fileData['file'];
            $path = $file->store("submissions/{$submission->id}", 'public');

            FormSubmissionFile::create([
                'form_submission_id' => $submission->id,
                'field_name' => $fileData['field_name'],
                'original_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        $this->sendNotification($form, $submission);

        try {
            app(MarketingContactService::class)->upsertFromFormSubmission($submission, $form);
        } catch (\Exception $e) {
            Log::error("Failed to sync marketing contact: {$e->getMessage()}");
        }

        return $submission;
    }

    private function sendNotification(Form $form, FormSubmission $submission): void
    {
        $mailConfig = app(MailConfigService::class);

        if (!$mailConfig->isConfigured()) {
            $mailConfig->logIfNotConfigured("form:{$form->slug}");
            return;
        }

        $mailConfig->applyFromSettings();

        $fieldValues = [];
        foreach ($submission->data as $key => $value) {
            $field = $form->fields->firstWhere('name', $key);
            $label = $field ? $field->label : ucwords(str_replace('_', ' ', $key));
            $fieldValues[$label] = $value;
        }

        try {
            $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');
            Mail::to($adminEmail)->send(new AdminFormNotification($form, $submission, $fieldValues));
        } catch (\Exception $e) {
            Log::error("Failed to send admin form notification: {$e->getMessage()}");
        }

        try {
            $customerEmail = collect($submission->data)->first(fn($v, $k) => str_contains(strtolower($k), 'email'));
            if ($customerEmail && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                Mail::to($customerEmail)->send(new CustomerFormConfirmation($form, $submission));
            }
        } catch (\Exception $e) {
            Log::error("Failed to send customer form confirmation: {$e->getMessage()}");
        }
    }
}
