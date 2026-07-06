<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerBookingReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We Have Received Your Booking Request — Fine Jewellery Buyers',
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

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">We Have Received Your Booking</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Dear {$name}, thank you for booking with us. <strong>Our team will review your request and send you a confirmation email shortly.</strong>
                </p>
                <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:14px;margin:0 0 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                        <strong>Please note:</strong> This is not a confirmed appointment yet. You will receive a separate email once we have confirmed your booking.
                    </p>
                </div>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Requested service:</strong> {$service}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Requested date:</strong> {$date}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Requested time:</strong> {$time}</p>
                </div>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    Questions? Call <strong>{$phone}</strong> or email <strong>{$emailAddr}</strong>
                </p>
                <p style="margin:0;font-size:13px;color:#9ca3af;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
        HTML;
    }
}
