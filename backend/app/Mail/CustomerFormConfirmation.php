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
        $conversationUrl = htmlspecialchars(app(\App\Services\SubmissionConversationService::class)->conversationUrl($this->submission));

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{$businessName}</title>
        </head>
        <body style="margin:0;padding:0;background:#f3f4f6;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-collapse:collapse;">
                <tr>
                    <td align="center" style="padding:12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-collapse:collapse;">
                            <tr>
                                <td style="background:#D97706;color:#ffffff;padding:20px 16px;">
                                    <p style="margin:0;font-size:18px;line-height:1.3;font-weight:700;">{$businessName}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:16px;">
                                    <p style="margin:0 0 8px;font-size:18px;line-height:1.3;color:#111827;font-weight:700;">Thank You for Your Enquiry</p>
                                    <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
                                        We have received your <strong>{$formTitle}</strong> submission. Here is a copy of what you sent us:
                                    </p>
                                </td>
                            </tr>
                            {$summaryRows}
                            <tr>
                                <td style="padding:16px;border-top:1px solid #e5e7eb;">
                                    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
                                        A member of our team will review your submission and contact you within 24 hours with an exact valuation.
                                    </p>
                                    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
                                        If your enquiry is urgent, please contact us directly:
                                    </p>
                                    <p style="margin:0 0 6px;font-size:15px;line-height:1.5;color:#374151;word-break:break-word;"><strong>Phone:</strong> {$phone}</p>
                                    <p style="margin:0 0 6px;font-size:15px;line-height:1.5;color:#374151;word-break:break-word;"><strong>Email:</strong> {$email}</p>
                                    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#374151;word-break:break-word;"><strong>Address:</strong> {$address}</p>
                                    <a href="{$conversationUrl}" style="display:block;background:#000000;color:#ffffff;padding:14px 16px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;">View &amp; Reply to Your Enquiry</a>
                                    <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">Your uploaded photos are attached to this email. Use the button above to message us anytime.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
                $index = 1;
                $total = $files->count();
                foreach ($files as $file) {
                    $name = htmlspecialchars($file->original_name);
                    $url = htmlspecialchars($file->publicUrl());
                    $content .= "<p style=\"margin:0 0 4px;font-size:14px;color:#374151;\">Photo {$index} of {$total}</p>";
                    $content .= "<p style=\"margin:0 0 8px;font-size:12px;line-height:1.4;color:#6b7280;word-break:break-all;\">{$name}</p>";
                    if ($file->isImage()) {
                        $content .= "<img src=\"{$url}\" alt=\"{$name}\" width=\"100%\" style=\"display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:8px;margin:0 0 12px;\">";
                    }
                    $index++;
                }
            }
        } elseif ($key === 'estimated_total') {
            $content = '<strong style="font-size:18px;color:#D97706;">' . htmlspecialchars((string) $value) . '</strong>';
        } elseif ($key === 'gold_items') {
            $content = '<div style="white-space:pre-line;line-height:1.6;">' . nl2br(htmlspecialchars((string) $value)) . '</div>';
        } else {
            $content = nl2br(htmlspecialchars((string) $value));
        }

        return <<<HTML
        <tr>
            <td style="padding:14px 16px;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">{$label}</p>
                <div style="margin:0;font-size:16px;line-height:1.5;color:#111827;word-break:break-word;">{$content}</div>
            </td>
        </tr>
        HTML;
    }
}
