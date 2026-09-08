<?php

namespace App\Mail;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
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
        $fields = '';
        $photos = '';

        foreach ($this->buildOrderedFields() as $label => $meta) {
            if ($meta['type'] === 'file') {
                $photos = $this->formatFilesHtml($this->submission->files->where('field_name', $meta['name']));
                continue;
            }

            $labelEsc = htmlspecialchars($label);
            $value = $this->formatValue($meta['name'], $meta['type'], $meta['value']);
            $fields .= <<<HTML
            <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">{$labelEsc}</p>
                    <div style="margin:0;font-size:16px;line-height:1.5;color:#111827;word-break:break-word;">{$value}</div>
                </td>
            </tr>
            HTML;
        }

        if ($photos === '' && $this->submission->files->isNotEmpty()) {
            $photos = $this->formatFilesHtml($this->submission->files);
        }

        $formTitle = htmlspecialchars($this->form->title);
        $timestamp = $this->submission->created_at->format('d M Y \a\t H:i');
        $ip = htmlspecialchars($this->submission->ip_address ?? 'N/A');

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New {$formTitle} Submission</title>
        </head>
        <body style="margin:0;padding:0;background:#f3f4f6;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-collapse:collapse;">
                <tr>
                    <td align="center" style="padding:12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-collapse:collapse;border-radius:12px;overflow:hidden;">
                            <tr>
                                <td style="background:#111827;color:#ffffff;padding:20px 16px;">
                                    <p style="margin:0;font-size:18px;line-height:1.3;font-weight:700;">New {$formTitle} Submission</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:14px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                                    <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">Received on {$timestamp}<br>IP: {$ip}</p>
                                </td>
                            </tr>
                            {$fields}
                            {$photos}
                            <tr>
                                <td style="padding:14px 16px;">
                                    <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">Photos are also attached to this email so you can open them full size.</p>
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

    private function buildOrderedFields(): array
    {
        if ($this->form->slug === 'gold-valuation') {
            return $this->buildGoldValuationFields();
        }

        $ordered = [];
        $handled = [];

        $extraOrder = ['gold_items', 'estimated_total', 'items_count'];
        foreach ($this->form->fields->sortBy('order') as $field) {
            if ($field->type === 'file') {
                $ordered[$field->label] = ['name' => $field->name, 'type' => 'file', 'value' => ''];
            } elseif (array_key_exists($field->name, $this->submission->data)) {
                $ordered[$field->label] = ['name' => $field->name, 'type' => $field->type, 'value' => $this->submission->data[$field->name]];
            }
            $handled[] = $field->name;
        }

        foreach ($extraOrder as $key) {
            if (isset($this->submission->data[$key]) && !in_array($key, $handled, true)) {
                $label = ucwords(str_replace('_', ' ', $key));
                $ordered[$label] = ['name' => $key, 'type' => 'text', 'value' => $this->submission->data[$key]];
                $handled[] = $key;
            }
        }

        foreach ($this->submission->data as $key => $value) {
            if (in_array($key, $handled, true) || str_starts_with($key, '_')) {
                continue;
            }
            $label = ucwords(str_replace('_', ' ', $key));
            $ordered[$label] = ['name' => $key, 'type' => 'text', 'value' => $value];
        }

        return $ordered;
    }

    private function buildGoldValuationFields(): array
    {
        $data = $this->submission->data;
        $spec = [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
            ['name' => 'email', 'label' => 'Email Address', 'type' => 'email'],
            ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone'],
            ['name' => 'expected_price', 'label' => 'Expected Price', 'type' => 'text'],
            ['name' => 'gold_items', 'label' => 'Gold Items', 'type' => 'text'],
            ['name' => 'estimated_total', 'label' => 'Estimated Total', 'type' => 'text'],
            ['name' => 'items_count', 'label' => 'Items Count', 'type' => 'text'],
            ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file'],
        ];

        $ordered = [];
        foreach ($spec as $item) {
            if ($item['type'] === 'file' || array_key_exists($item['name'], $data)) {
                $ordered[$item['label']] = [
                    'name' => $item['name'],
                    'type' => $item['type'],
                    'value' => $data[$item['name']] ?? '',
                ];
            }
        }

        return $ordered;
    }

    private function formatValue(string $fieldName, string $type, mixed $value): string
    {
        $files = $this->submission->files->where('field_name', $fieldName);
        if ($type === 'file' || $files->isNotEmpty()) {
            return $this->formatFilesHtml($files);
        }

        if ($fieldName === 'estimated_total') {
            return '<strong style="font-size:18px;color:#D97706;">' . htmlspecialchars((string) $value) . '</strong>';
        }

        if ($fieldName === 'gold_items') {
            $text = htmlspecialchars((string) $value);
            return '<div style="white-space:pre-line;line-height:1.6;">' . nl2br($text) . '</div>';
        }

        $text = htmlspecialchars((string) $value);
        if (in_array($fieldName, ['email'], true) || $type === 'email' || filter_var((string) $value, FILTER_VALIDATE_EMAIL)) {
            return '<a href="mailto:' . $text . '" style="color:#D97706;font-weight:600;word-break:break-all;">' . $text . '</a>';
        }
        if (in_array($fieldName, ['phone'], true) || $type === 'phone') {
            $tel = preg_replace('/\s+/', '', (string) $value);
            return '<a href="tel:' . htmlspecialchars($tel) . '" style="color:#D97706;font-weight:600;">' . $text . '</a>';
        }

        return nl2br($text);
    }

    private function formatFilesHtml($files): string
    {
        if ($files->isEmpty()) {
            return <<<HTML
            <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">Upload Photos</p>
                    <p style="margin:0;font-size:16px;color:#9ca3af;">No photos uploaded</p>
                </td>
            </tr>
            HTML;
        }

        $html = <<<HTML
        <tr>
            <td style="padding:14px 16px 8px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">Upload Photos</p>
            </td>
        </tr>
        HTML;

        $index = 1;
        $total = $files->count();
        foreach ($files as $file) {
            $name = htmlspecialchars($file->original_name);
            $url = htmlspecialchars($file->publicUrl());
            $image = '';
            if ($file->isImage()) {
                $image = "<img src=\"{$url}\" alt=\"{$name}\" width=\"100%\" style=\"display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:8px;\">";
            }

            $html .= <<<HTML
            <tr>
                <td style="padding:0 16px 16px;">
                    <p style="margin:0 0 8px;font-size:14px;line-height:1.4;color:#374151;">Photo {$index} of {$total}</p>
                    <a href="{$url}" style="color:#D97706;font-weight:600;font-size:14px;line-height:1.4;word-break:break-all;text-decoration:underline;">View full photo</a>
                    <p style="margin:4px 0 10px;font-size:12px;line-height:1.4;color:#6b7280;word-break:break-all;">{$name}</p>
                    {$image}
                </td>
            </tr>
            HTML;
            $index++;
        }

        return $html;
    }
}
