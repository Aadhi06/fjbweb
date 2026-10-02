<?php

namespace App\Mail;

use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminComposeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $toName,
        public string $subjectLine,
        public string $bodyText,
    ) {}

    public function envelope(): Envelope
    {
        $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');

        return new Envelope(
            subject: $this->subjectLine,
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
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $name = htmlspecialchars($this->toName ?: 'there');
        $body = nl2br(htmlspecialchars($this->bodyText));
        $phone = htmlspecialchars(Setting::get('phone', '020 3411 1438'));

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">Dear {$name},</p>
                <div style="color:#111827;font-size:14px;line-height:1.7;">{$body}</div>
                <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
                    Fine Jewellery Buyers · {$phone}
                </p>
            </div>
        </div>
        HTML;
    }
}
