<?php

namespace App\Mail;

use App\Models\FormSubmission;
use App\Models\FormSubmissionMessage;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerSubmissionReply extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public FormSubmission $submission,
        public FormSubmissionMessage $messageRecord,
        public string $conversationUrl,
        public ?string $adminName = null,
    ) {}

    public function envelope(): Envelope
    {
        $formTitle = $this->submission->form?->title ?? 'Your enquiry';
        $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');

        return new Envelope(
            subject: "Re: {$formTitle} — Fine Jewellery Buyers",
            replyTo: [
                new Address($adminEmail, Setting::get('business_name', 'Fine Jewellery Buyers')),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    private function buildHtml(): string
    {
        $service = app(\App\Services\SubmissionConversationService::class);
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $name = htmlspecialchars($service->customerName($this->submission));
        $from = htmlspecialchars($this->adminName ?? $businessName);
        $message = nl2br(htmlspecialchars($this->messageRecord->body));
        $trackedUrl = htmlspecialchars($service->trackedConversationUrl($this->submission, $this->messageRecord));
        $pixelUrl = htmlspecialchars($service->openPixelUrl($this->messageRecord));
        $formTitle = htmlspecialchars($this->submission->form?->title ?? 'your enquiry');
        $plainUrl = htmlspecialchars($this->conversationUrl);

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">Dear {$name},</p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">We have replied to your <strong>{$formTitle}</strong>:</p>
                <div style="background:#f9fafb;border-left:4px solid #D97706;padding:16px;margin:0 0 20px;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 6px;font-size:12px;color:#92400e;font-weight:600;">{$from}</p>
                    <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">{$message}</p>
                </div>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                    Please use the button below to reply so we can keep the conversation in one place. If you reply to this email instead, it will still reach our team.
                </p>
                <p style="margin:0 0 20px;text-align:center;">
                    <a href="{$trackedUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Reply to Fine Jewellery Buyers</a>
                </p>
                <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">Or copy this link: {$plainUrl}</p>
                <img src="{$pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
            </div>
        </div>
        HTML;
    }
}
