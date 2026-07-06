<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerBookingConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment Is Confirmed — Fine Jewellery Buyers',
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
        $date = $b->booking_date->format('l, j F Y');
        $time = htmlspecialchars($b->booking_time);

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#16a34a;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Your Appointment Is Confirmed</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Dear {$name}, your appointment has been <strong>confirmed</strong>. We look forward to seeing you.
                </p>
                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Service:</strong> {$service}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Date:</strong> {$date}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Time:</strong> {$time}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Location:</strong> {$address}</p>
                </div>
                <h3 style="margin:0 0 8px;font-size:14px;color:#111827;">What to Bring</h3>
                <ul style="margin:0 0 16px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
                    <li>The item(s) you wish to sell or have valued</li>
                    <li>Any certificates, receipts, or documentation</li>
                    <li>A valid form of photo ID</li>
                </ul>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                    Need to change your appointment? Call <strong>{$phone}</strong> or email <strong>{$emailAddr}</strong>
                </p>
                <p style="margin:0;font-size:13px;color:#9ca3af;">This is your official confirmation email.</p>
            </div>
        </div>
        HTML;
    }
}
