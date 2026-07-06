<?php

namespace App\Services;

use App\Mail\AdminCustomerReplyNotification;
use App\Mail\CustomerSubmissionReply;
use App\Models\FormSubmission;
use App\Models\FormSubmissionMessage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SubmissionConversationService
{
    public function ensureReplyToken(FormSubmission $submission): string
    {
        if (!$submission->reply_token) {
            $submission->update(['reply_token' => Str::random(48)]);
            $submission->refresh();
        }

        return $submission->reply_token;
    }

    public function conversationUrl(FormSubmission $submission): string
    {
        $frontend = rtrim(Setting::get('frontend_url', config('app.frontend_url', 'https://finejewellerybuyers.co.uk')), '/');
        $token = $this->ensureReplyToken($submission);

        return "{$frontend}/enquiry/{$token}";
    }

    public function sendAdminReply(FormSubmission $submission, string $message, ?User $admin = null): FormSubmissionMessage
    {
        $submission->load('form');

        $record = FormSubmissionMessage::create([
            'form_submission_id' => $submission->id,
            'sender' => 'admin',
            'body' => $message,
            'admin_user_id' => $admin?->id,
        ]);

        $submission->update(['status' => 'replied']);

        $this->emailCustomer($submission, $message, $admin?->name);

        return $record;
    }

    public function sendCustomerReply(FormSubmission $submission, string $message): FormSubmissionMessage
    {
        $submission->load('form');

        $record = FormSubmissionMessage::create([
            'form_submission_id' => $submission->id,
            'sender' => 'customer',
            'body' => $message,
        ]);

        $submission->update(['status' => 'new']);

        $this->emailAdmin($submission, $message);

        return $record;
    }

    private function emailCustomer(FormSubmission $submission, string $message, ?string $adminName): void
    {
        $mailConfig = app(MailConfigService::class);
        if (!$mailConfig->isConfigured()) {
            $mailConfig->logIfNotConfigured('submission-reply-customer');
            return;
        }

        $email = $this->customerEmail($submission);
        if (!$email) {
            return;
        }

        $mailConfig->applyFromSettings();

        try {
            Mail::to($email)->send(new CustomerSubmissionReply(
                $submission,
                $message,
                $this->conversationUrl($submission),
                $adminName,
            ));
        } catch (\Exception $e) {
            Log::error("Failed to send submission reply to customer: {$e->getMessage()}");
        }
    }

    private function emailAdmin(FormSubmission $submission, string $message): void
    {
        $mailConfig = app(MailConfigService::class);
        if (!$mailConfig->isConfigured()) {
            return;
        }

        $mailConfig->applyFromSettings();

        try {
            $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');
            Mail::to($adminEmail)->send(new AdminCustomerReplyNotification(
                $submission,
                $message,
                $this->conversationUrl($submission),
            ));
        } catch (\Exception $e) {
            Log::error("Failed to send customer reply notification to admin: {$e->getMessage()}");
        }
    }

    public function customerEmail(FormSubmission $submission): ?string
    {
        $email = collect($submission->data)->first(fn ($v, $k) => str_contains(strtolower((string) $k), 'email'));

        return $email && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    public function customerName(FormSubmission $submission): string
    {
        foreach (['name', 'full_name', 'first_name'] as $key) {
            if (!empty($submission->data[$key])) {
                return (string) $submission->data[$key];
            }
        }

        return 'Customer';
    }

    public function formatMessages(FormSubmission $submission): array
    {
        return $submission->messages()
            ->with('adminUser:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(fn (FormSubmissionMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'admin_name' => $m->adminUser?->name,
                'created_at' => $m->created_at->toIso8601String(),
                'created_at_human' => $m->created_at->diffForHumans(),
            ])
            ->all();
    }
}
