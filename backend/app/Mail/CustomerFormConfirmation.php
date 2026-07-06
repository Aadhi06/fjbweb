<?php

namespace App\Mail;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerFormConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Form $form,
        public FormSubmission $submission,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->form->slug === 'gold-valuation'
            ? 'Your Gold Valuation Request — Fine Jewellery Buyers'
            : 'Thank you for contacting Fine Jewellery Buyers';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    public function attachments(): array
    {
        return $this->submission->files->map(fn ($file) =>
            Attachment::fromStorageDisk('public', $file->file_path)
                ->as($file->original_name)
                ->withMime($file->mime_type ?? 'application/octet-stream')
        )->all();
    }

    private function buildHtml(): string
    {
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $phone = htmlspecialchars(Setting::get('phone', '020 3123 4567'));
        $email = htmlspecialchars(Setting::get('email', 'info@finejewellerybuyers.co.uk'));
        $address = htmlspecialchars(Setting::get('address', '88–90 Hatton Garden, 4th Floor, Office No. 39, London EC1N 8AA'));
        $formTitle = htmlspecialchars($this->form->title);
        $summaryRows = $this->buildSummaryRows();

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Thank You for Your Enquiry</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    We have received your <strong>{$formTitle}</strong> submission. Here is a copy of what you sent us:
                </p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">
                    {$summaryRows}
                </table>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    A member of our team will review your submission and contact you within 24 hours with an exact valuation.
                </p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    If your enquiry is urgent, please contact us directly:
                </p>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Phone:</strong> {$phone}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Email:</strong> {$email}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Address:</strong> {$address}</p>
                </div>
                <p style="margin:0;font-size:13px;color:#9ca3af;">Your uploaded photos are attached to this email for your records.</p>
            </div>
        </div>
        HTML;
    }

    private function buildSummaryRows(): string
    {
        $rows = '';
        $data = $this->submission->data;
        $order = ['gold_items', 'estimated_total', 'items_count', 'expected_price', 'name', 'email', 'phone'];
        $handled = [];

        foreach ($order as $key) {
            if (!array_key_exists($key, $data)) {
                continue;
            }
            $rows .= $this->summaryRow($key, $data[$key]);
            $handled[] = $key;
        }

        foreach ($data as $key => $value) {
            if (in_array($key, $handled, true) || str_starts_with($key, '_') || $key === 'photos') {
                continue;
            }
            $rows .= $this->summaryRow($key, $value);
        }

        if ($this->submission->files->isNotEmpty()) {
            $rows .= $this->summaryRow('photos', null, true);
        }

        return $rows;
    }

    private function summaryRow(string $key, mixed $value, bool $photosOnly = false): string
    {
        $label = htmlspecialchars(ucwords(str_replace('_', ' ', $key)));
        $content = '';

        if ($photosOnly || $key === 'photos') {
            $files = $this->submission->files;
            if ($files->isEmpty()) {
                $content = htmlspecialchars((string) $value);
            } else {
                foreach ($files as $file) {
                    $name = htmlspecialchars($file->original_name);
                    $url = htmlspecialchars($file->publicUrl());
                    $content .= "<p style=\"margin:0 0 8px;\">{$name}</p>";
                    if ($file->isImage()) {
                        $content .= "<img src=\"{$url}\" alt=\"{$name}\" style=\"max-width:240px;height:auto;border-radius:8px;border:1px solid #e5e7eb;display:block;margin-bottom:8px;\">";
                    }
                }
            }
        } elseif ($key === 'estimated_total') {
            $content = '<strong style="font-size:18px;color:#D97706;">' . htmlspecialchars((string) $value) . '</strong>';
        } elseif ($key === 'gold_items') {
            $content = '<div style="white-space:pre-line;line-height:1.6;">' . nl2br(htmlspecialchars((string) $value)) . '</div>';
        } else {
            $content = nl2br(htmlspecialchars((string) $value));
        }

        return "<tr><td style=\"padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;\">{$label}</td><td style=\"padding:8px 12px;border:1px solid #e5e7eb;color:#111827;\">{$content}</td></tr>";
    }
}
