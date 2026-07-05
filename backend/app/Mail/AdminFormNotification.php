<?php

namespace App\Mail;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminFormNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Form $form,
        public FormSubmission $submission,
        public array $fieldValues,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New {$this->form->title} Submission",
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
        $rows = '';
        foreach ($this->fieldValues as $label => $value) {
            $label = htmlspecialchars($label);
            $value = nl2br(htmlspecialchars((string) $value));
            $rows .= "<tr><td style=\"padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;\">{$label}</td><td style=\"padding:8px 12px;border:1px solid #e5e7eb;color:#111827;\">{$value}</td></tr>";
        }

        $formTitle = htmlspecialchars($this->form->title);
        $timestamp = $this->submission->created_at->format('d M Y \a\t H:i');
        $ip = htmlspecialchars($this->submission->ip_address ?? 'N/A');

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#111827;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">New {$formTitle} Submission</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">Received on {$timestamp} &middot; IP: {$ip}</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    {$rows}
                </table>
                <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">This is an automated notification from Fine Jewellery Buyers.</p>
            </div>
        </div>
        HTML;
    }
}
