<?php

namespace App\Mail;

use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AdminDailyAppointments extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Collection $today,
        public Collection $tomorrow,
        public string $todayLabel,
        public string $tomorrowLabel,
    ) {}

    public function envelope(): Envelope
    {
        $count = $this->today->count() + $this->tomorrow->count();

        return new Envelope(
            subject: "Today & tomorrow's appointments ({$count}) — Fine Jewellery Buyers",
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    private function buildHtml(): string
    {
        $todayRows = $this->rowsHtml($this->today);
        $tomorrowRows = $this->rowsHtml($this->tomorrow);
        $todayCount = $this->today->count();
        $tomorrowCount = $this->tomorrow->count();
        $adminUrl = htmlspecialchars(rtrim(Setting::get('frontend_url', 'https://www.finejewellerybuyers.co.uk'), '/') . '/admin?tab=bookings');

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:20px;">
            <div style="background:#111827;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">Appointments digest</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#d1d5db;">Today and tomorrow — pending &amp; confirmed</p>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 8px;font-size:15px;color:#111827;">Today — {$this->todayLabel} ({$todayCount})</h2>
                {$todayRows}
                <h2 style="margin:24px 0 8px;font-size:15px;color:#111827;">Tomorrow — {$this->tomorrowLabel} ({$tomorrowCount})</h2>
                {$tomorrowRows}
                <p style="margin:24px 0 0;">
                    <a href="{$adminUrl}" style="display:inline-block;background:#D97706;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Open Bookings</a>
                </p>
            </div>
        </div>
        HTML;
    }

    private function rowsHtml(Collection $bookings): string
    {
        if ($bookings->isEmpty()) {
            return '<p style="margin:0;font-size:14px;color:#6b7280;">No appointments.</p>';
        }

        $rows = '';
        foreach ($bookings as $b) {
            $name = htmlspecialchars($b->name);
            $email = htmlspecialchars($b->email);
            $phone = htmlspecialchars($b->phone);
            $service = htmlspecialchars($b->service_type);
            $time = htmlspecialchars($b->booking_time);
            $status = htmlspecialchars(ucfirst($b->status));
            $notes = htmlspecialchars($b->notes ?: '—');
            $rows .= <<<HTML
            <tr>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;color:#111827;">{$time}</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;color:#111827;">{$name}<br><span style="color:#6b7280;">{$email}<br>{$phone}</span></td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;color:#111827;">{$service}</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;color:#111827;">{$status}</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">{$notes}</td>
            </tr>
            HTML;
        }

        return <<<HTML
        <table style="width:100%;border-collapse:collapse;">
            <tr>
                <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">Time</th>
                <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">Customer</th>
                <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">Service</th>
                <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">Status</th>
                <th style="text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">Notes</th>
            </tr>
            {$rows}
        </table>
        HTML;
    }
}
