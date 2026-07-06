<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerBookingCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public ?string $reason = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Booking Has Been Cancelled — Fine Jewellery Buyers',
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    private function buildHtml(): string
    {
        $b = $this->booking;
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $phone = htmlspecialchars(Setting::get('phone', '020 3411 1438'));
        $emailAddr = htmlspecialchars(Setting::get('email', 'info@finejewellerybuyers.co.uk'));
        $name = htmlspecialchars($b->name);
        $service = htmlspecialchars($b->service_type);
        $date = $b->booking_date->format('l, j F Y');
        $time = htmlspecialchars($b->booking_time);
        $reasonBlock = $this->reason
            ? '<p style="margin:0 0 16px;color:#374151;font-size:14px;"><strong>Reason:</strong> ' . htmlspecialchars($this->reason) . '</p>'
            : '';

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#dc2626;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Booking Cancelled</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Dear {$name}, your appointment request has been cancelled.
                </p>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Service:</strong> {$service}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Date:</strong> {$date}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Time:</strong> {$time}</p>
                </div>
                {$reasonBlock}
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                    You can book a new appointment on our website or contact us on <strong>{$phone}</strong> / <strong>{$emailAddr}</strong>
                </p>
            </div>
        </div>
        HTML;
    }
}
