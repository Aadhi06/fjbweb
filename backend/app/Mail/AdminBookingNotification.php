<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminBookingNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
    ) {}

    public function envelope(): Envelope
    {
        $date = $this->booking->booking_date->format('d M Y');
        return new Envelope(
            subject: "New Booking: {$this->booking->name} - {$date} {$this->booking->booking_time}",
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
        $name = htmlspecialchars($b->name);
        $email = htmlspecialchars($b->email);
        $phone = htmlspecialchars($b->phone);
        $service = htmlspecialchars($b->service_type);
        $date = $b->booking_date->format('l, j F Y');
        $time = htmlspecialchars($b->booking_time);
        $notes = htmlspecialchars($b->notes ?? 'None');

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#111827;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">New Booking Received</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Name</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$name}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Email</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$email}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Phone</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$phone}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Service</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$service}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Date</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$date}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Time</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$time}</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Notes</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">{$notes}</td></tr>
                </table>
                <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">This is an automated notification from Fine Jewellery Buyers.</p>
            </div>
        </div>
        HTML;
    }
}
