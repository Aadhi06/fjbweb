<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class MailConfigService
{
    /**
     * @param  array<string, mixed>|null  $override  Optional unsaved admin form values for SMTP test
     */
    public function applyFromSettings(?array $override = null): bool
    {
        $host = $this->value('smtp_host', $override) ?: env('MAIL_HOST');

        if (!$host) {
            return false;
        }

        $port = (int) ($this->value('smtp_port', $override) ?: env('MAIL_PORT', 587));
        $username = $this->value('smtp_username', $override) ?: env('MAIL_USERNAME');
        $password = $this->value('smtp_password', $override) ?: env('MAIL_PASSWORD');
        $encryption = strtolower((string) ($this->value('smtp_encryption', $override) ?: env('MAIL_ENCRYPTION', 'tls')));
        $fromAddress = $this->value('smtp_from_address', $override) ?: env('MAIL_FROM_ADDRESS', 'noreply@finejewellerybuyers.co.uk');
        $fromName = $this->value('smtp_from_name', $override) ?: env('MAIL_FROM_NAME', 'Fine Jewellery Buyers');

        // Port 587 = STARTTLS (TLS). Port 465 = implicit SSL (smtps).
        $scheme = ($port === 465 || $encryption === 'ssl') ? 'smtps' : null;
        if ($port === 587) {
            $scheme = null;
        }

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.transport', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);
        Config::set('mail.mailers.smtp.scheme', $scheme);
        Config::set('mail.from.address', $fromAddress);
        Config::set('mail.from.name', $fromName);

        return true;
    }

    public function isConfigured(?array $override = null): bool
    {
        $host = $this->value('smtp_host', $override) ?: env('MAIL_HOST');

        return !empty($host);
    }

    public function logIfNotConfigured(string $context): void
    {
        if (!$this->isConfigured()) {
            Log::warning("Email not sent ({$context}): SMTP not configured in Admin → Settings → SMTP or .env");
        }
    }

    /**
     * @param  array<string, mixed>|null  $override
     * @return array<string, string>
     */
    public function diagnostics(?array $override = null): array
    {
        $host = (string) ($this->value('smtp_host', $override) ?: env('MAIL_HOST', ''));
        $port = (int) ($this->value('smtp_port', $override) ?: env('MAIL_PORT', 587));
        $encryption = strtolower((string) ($this->value('smtp_encryption', $override) ?: env('MAIL_ENCRYPTION', 'tls')));
        $username = (string) ($this->value('smtp_username', $override) ?: env('MAIL_USERNAME', ''));
        $password = (string) ($this->value('smtp_password', $override) ?: env('MAIL_PASSWORD', ''));
        $fromAddress = (string) ($this->value('smtp_from_address', $override) ?: env('MAIL_FROM_ADDRESS', ''));
        $fromName = (string) ($this->value('smtp_from_name', $override) ?: env('MAIL_FROM_NAME', ''));

        $scheme = ($port === 465 || $encryption === 'ssl') ? 'smtps (SSL)' : 'STARTTLS (TLS)';
        if ($port === 587) {
            $scheme = 'STARTTLS (TLS)';
        }

        $maskedUser = $username !== ''
            ? substr($username, 0, min(8, strlen($username))) . '***'
            : '(missing)';

        return [
            'Host' => $host ?: '(missing)',
            'Port' => (string) $port,
            'Encryption setting' => $encryption,
            'Connection mode' => $scheme,
            'Username' => $maskedUser,
            'Password' => $password !== '' ? '(set)' : '(missing — required)',
            'From email' => $fromAddress ?: '(missing)',
            'From name' => $fromName ?: '(missing)',
        ];
    }

    private function value(string $key, ?array $override): mixed
    {
        if ($override !== null && array_key_exists($key, $override) && $override[$key] !== '' && $override[$key] !== null) {
            return $override[$key];
        }

        return Setting::get($key);
    }
}
