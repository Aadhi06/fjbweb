<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerBookingRescheduled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $previousDate,
        public string $previousTime,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment Has Been Rescheduled — Fine Jewellery Buyers',
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
        $address = htmlspecialchars(Setting::get('address', 'Suite 39, 88–90 Hatton Garden, London EC1N 8PN'));
        $name = htmlspecialchars($b->name);
        $service = htmlspecialchars($b->service_type);
        $newDate = $b->booking_date->format('l, j F Y');
        $newTime = htmlspecialchars($b->booking_time);
        $prevDate = htmlspecialchars($this->previousDate);
        $prevTime = htmlspecialchars($this->previousTime);

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#2563eb;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Appointment Rescheduled</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Dear {$name}, your appointment has been rescheduled to a new date and time.
                </p>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px;margin:0 0 12px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#991b1b;font-weight:600;text-transform:uppercase;">Previous</p>
                    <p style="margin:0;font-size:14px;color:#374151;">{$prevDate} at {$prevTime}</p>
                </div>
                <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:14px;margin:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#1d4ed8;font-weight:600;text-transform:uppercase;">New appointment</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Service:</strong> {$service}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Date:</strong> {$newDate}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Time:</strong> {$newTime}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Location:</strong> {$address}</p>
                </div>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                    Questions? Call <strong>{$phone}</strong> or email <strong>{$emailAddr}</strong>
                </p>
            </div>
        </div>
        HTML;
    }
}
