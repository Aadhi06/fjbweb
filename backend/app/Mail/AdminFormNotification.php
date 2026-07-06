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
        $rows = '';
        foreach ($this->buildOrderedFields() as $label => $meta) {
            $labelEsc = htmlspecialchars($label);
            $value = $this->formatValue($meta['name'], $meta['type'], $meta['value']);
            $rows .= "<tr><td style=\"padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;\">{$labelEsc}</td><td style=\"padding:8px 12px;border:1px solid #e5e7eb;color:#111827;\">{$value}</td></tr>";
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
                <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">Uploaded photos are attached to this email and shown above when possible.</p>
            </div>
        </div>
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

        return nl2br(htmlspecialchars((string) $value));
    }

    private function formatFilesHtml($files): string
    {
        if ($files->isEmpty()) {
            return '<span style="color:#9ca3af;">No files uploaded</span>';
        }

        $html = '';
        foreach ($files as $file) {
            $name = htmlspecialchars($file->original_name);
            $url = htmlspecialchars($file->publicUrl());
            $html .= "<p style=\"margin:0 0 8px;\"><a href=\"{$url}\" style=\"color:#D97706;font-weight:600;\">View {$name}</a></p>";
            if ($file->isImage()) {
                $html .= "<img src=\"{$url}\" alt=\"{$name}\" style=\"max-width:280px;height:auto;border-radius:8px;border:1px solid #e5e7eb;display:block;margin-bottom:12px;\">";
            }
        }

        return $html;
    }
}
