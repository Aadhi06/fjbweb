<?php

namespace App\Mail;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
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
        return new Envelope(
            subject: 'Thank you for contacting Fine Jewellery Buyers',
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
        $businessName = htmlspecialchars(Setting::get('business_name', 'Fine Jewellery Buyers'));
        $phone = htmlspecialchars(Setting::get('phone', '020 3123 4567'));
        $email = htmlspecialchars(Setting::get('email', 'info@finejewellerybuyers.co.uk'));
        $address = htmlspecialchars(Setting::get('address', '88–90 Hatton Garden, 4th Floor, Office No. 39, London EC1N 8AA'));
        $formTitle = htmlspecialchars($this->form->title);

        return <<<HTML
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#D97706;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:18px;">{$businessName}</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Thank You for Your Enquiry</h2>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    We have received your <strong>{$formTitle}</strong> submission and a member of our team will be in touch shortly.
                </p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
                    If your enquiry is urgent, please don't hesitate to contact us directly:
                </p>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Phone:</strong> {$phone}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>Email:</strong> {$email}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Address:</strong> {$address}</p>
                </div>
                <p style="margin:0;font-size:13px;color:#9ca3af;">This is an automated confirmation. Please do not reply to this email.</p>
            </div>
        </div>
        HTML;
    }
}
