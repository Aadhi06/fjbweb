<?php

namespace App\Mail;

use App\Models\FormSubmission;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminCustomerReplyNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public FormSubmission $submission,
        public string $message,
        public string $conversationUrl,
    ) {}

    public function envelope(): Envelope
    {
        $service = app(\App\Services\SubmissionConversationService::class);
        $name = $service->customerName($this->submission);

        return new Envelope(
            subject: "Customer replied: {$name} — Fine Jewellery Buyers",
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    private function buildHtml(): string
    {
        $service = app(\App\Services\SubmissionConversationService::class);
        $name = htmlspecialchars($service->customerName($this->submission));
        $email = htmlspecialchars($service->customerEmail($this->submission) ?? 'N/A');
        $formTitle = htmlspecialchars($this->submission->form?->title ?? 'Form submission');
        $message = nl2br(htmlspecialchars($this->message));
        $adminUrl = htmlspecialchars(rtrim(Setting::get('frontend_url', 'https://finejewellerybuyers.co.uk'), '/') . '/admin?tab=messages');

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#111827;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">Customer Reply</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <p style="margin:0 0 12px;font-size:14px;color:#374151;"><strong>{$name}</strong> ({$email}) replied to <strong>{$formTitle}</strong>:</p>
                <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;margin:0 0 20px;border-radius:0 8px 8px 0;">
                    <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">{$message}</p>
                </div>
                <p style="margin:0 0 16px;font-size:14px;color:#374151;">
                    <a href="{$adminUrl}" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Open Messages in Admin</a>
                </p>
                <p style="margin:0;font-size:13px;color:#9ca3af;">You will also see a notification badge in the admin panel.</p>
            </div>
        </div>
        HTML;
    }
}
