<?php

namespace App\Mail;

use App\Models\MarketingCampaign;
use App\Models\Setting;
use App\Services\MarketingEmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MarketingCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public MarketingCampaign $campaign,
        public string $recipientName = '',
    ) {}

    public function envelope(): Envelope
    {
        $fromName = Setting::get('business_name', 'Fine Jewellery Buyers');
        $fromEmail = Setting::get('email', config('mail.from.address'));

        return new Envelope(
            subject: $this->campaign->subject,
            from: new \Illuminate\Mail\Mailables\Address($fromEmail, $fromName),
        );
    }

    public function content(): Content
    {
        $body = $this->campaign->body_html;
        $name = $this->recipientName ?: 'there';
        $body = str_replace(['{{name}}', '{{NAME}}'], e($name), $body);

        $html = MarketingEmailTemplate::wrap($body, $this->campaign->subject);

        return new Content(htmlString: $html);
    }
}
