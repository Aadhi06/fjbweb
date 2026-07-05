<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerBookingConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Confirmed - Fine Jewellery Buyers',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $b = $this->booking;
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $phone = htmlspecialchars(Setting::get('phone', '020 3123 4567'));
        $emailAddr = htmlspecialchars(Setting::get('email', 'info@finejewellerybuyers.co.uk'));
        $address = htmlspecialchars(Setting::get('address', '88–90 Hatton Garden, 4th Floor, Office No. 39, London EC1N 8AA'));

        $name = htmlspecialchars($b->name);
        $service = htmlspecialchars($b->service_type);
        $date = $b->booking_date->format('l, j F Y');
        $time = htmlspecialchars($b->booking_time);

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Booking Confirmed</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Dear {$name}, your appointment has been confirmed. Here are the details:
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px;">
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

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151;">Need to reschedule?</p>
                    <p style="margin:0;font-size:14px;color:#374151;">
                        Call us on <strong>{$phone}</strong> or email <strong>{$emailAddr}</strong>
                    </p>
                </div>

                <p style="margin:0;font-size:13px;color:#9ca3af;">This is an automated confirmation. Please do not reply to this email.</p>
            </div>
        </div>
        HTML;
    }
}
