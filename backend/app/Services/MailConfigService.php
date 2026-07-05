<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class MailConfigService
{
    public function applyFromSettings(): bool
    {
        $host = Setting::get('smtp_host') ?: env('MAIL_HOST');

        if (!$host) {
            return false;
        }

        $port = (int) (Setting::get('smtp_port') ?: env('MAIL_PORT', 587));
        $username = Setting::get('smtp_username') ?: env('MAIL_USERNAME');
        $password = Setting::get('smtp_password') ?: env('MAIL_PASSWORD');
        $encryption = Setting::get('smtp_encryption') ?: env('MAIL_ENCRYPTION', 'tls');
        $fromAddress = Setting::get('smtp_from_address') ?: env('MAIL_FROM_ADDRESS', 'noreply@finejewellerybuyers.co.uk');
        $fromName = Setting::get('smtp_from_name') ?: env('MAIL_FROM_NAME', 'Fine Jewellery Buyers');

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.transport', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);
        Config::set('mail.mailers.smtp.scheme', $encryption === 'ssl' ? 'smtps' : null);
        Config::set('mail.from.address', $fromAddress);
        Config::set('mail.from.name', $fromName);

        return true;
    }

    public function isConfigured(): bool
    {
        $host = Setting::get('smtp_host') ?: env('MAIL_HOST');

        return !empty($host);
    }

    public function logIfNotConfigured(string $context): void
    {
        if (!$this->isConfigured()) {
            Log::warning("Email not sent ({$context}): SMTP not configured in Admin → Settings → SMTP or .env");
        }
    }
}
