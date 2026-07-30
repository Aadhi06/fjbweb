<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MetalRate;
use App\Models\Setting;
use App\Services\MailConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'business_name' => Setting::get('business_name', 'Fine Jewellery Buyers'),
                'tagline' => Setting::get('tagline', "UK's Trusted Buyer of Gold, Diamonds & Watches"),
                'phone' => Setting::get('phone', '020 3123 4567'),
                'whatsapp' => Setting::get('whatsapp', '442031234567'),
                'email' => Setting::get('email', 'info@finejewellerybuyers.co.uk'),
                'address' => Setting::get('address', '88–90 Hatton Garden, London EC1N 8AA'),
                'opening_hours' => Setting::get('opening_hours', 'Mon–Sat: 10am–6pm'),
                'logo_url' => Setting::get('logo_url', ''),
                'logo_size' => (int) Setting::get('logo_size', 48),
                'favicon_url' => Setting::get('favicon_url', ''),
                'social_share_image' => Setting::get('social_share_image', ''),
                'google_place_id' => Setting::get('google_place_id', ''),
                'google_review_url' => Setting::get('google_review_url', ''),
                'trustpilot_url' => Setting::get('trustpilot_url', ''),
                'google_rating' => Setting::get('google_rating', 4.9),
                'total_reviews' => Setting::get('total_reviews', 1000),
                'years_in_business' => Setting::get('years_in_business', 15),
                'happy_customers' => Setting::get('happy_customers', '10,000+'),
                'total_sales' => Setting::get('total_sales', '£5M+'),
                'gtm_id' => Setting::get('gtm_id', ''),
                'ga_id' => Setting::get('ga_id', ''),
                'meta_pixel_id' => Setting::get('meta_pixel_id', ''),
                'admin_email' => Setting::get('admin_email', 'info@finejewellerybuyers.co.uk'),
                'about_title' => Setting::get('about_title', 'About Fine Jewellery Buyers'),
                'about_description' => Setting::get('about_description', ''),
                'about_mission' => Setting::get('about_mission', ''),
                'about_vision' => Setting::get('about_vision', ''),
                'about_values' => Setting::get('about_values', '[]'),
                'top_bar_ticker' => Setting::get('top_bar_ticker', [
                    ['text' => 'Sell Your Gold Today', 'url' => '/live-rates', 'enabled' => true],
                    ['text' => 'We Buy Cartier, Tiffany & Boodles — Instant Cash', 'url' => '/services/sell-jewellery', 'enabled' => true],
                    ['text' => 'Free Valuation — No Obligation', 'url' => '/free-valuation', 'enabled' => true],
                    ['text' => 'Visit Us at Hatton Garden, London', 'url' => '/book-appointment', 'enabled' => true],
                ]),
                'top_bar_ticker_speed' => (int) Setting::get('top_bar_ticker_speed', 35),
                'newsletter_popup_enabled' => filter_var(Setting::get('newsletter_popup_enabled', true), FILTER_VALIDATE_BOOLEAN),
                'newsletter_popup_title' => Setting::get('newsletter_popup_title', 'Stay in Touch'),
                'newsletter_popup_message' => Setting::get('newsletter_popup_message', 'Join our list for gold price alerts, selling tips and exclusive offers from Hatton Garden.'),
                'newsletter_popup_button_text' => Setting::get('newsletter_popup_button_text', 'Subscribe'),
                'newsletter_popup_success_message' => Setting::get('newsletter_popup_success_message', 'Thank you! We look forward to keeping you updated.'),
                'newsletter_popup_delay_seconds' => (int) Setting::get('newsletter_popup_delay_seconds', 8),
                'newsletter_popup_cookie_days' => (int) Setting::get('newsletter_popup_cookie_days', 14),
                'newsletter_popup_show_name' => filter_var(Setting::get('newsletter_popup_show_name', false), FILTER_VALIDATE_BOOLEAN),
                'maintenance_mode' => filter_var(Setting::get('maintenance_mode', false), FILTER_VALIDATE_BOOLEAN),
                'maintenance_message' => Setting::get('maintenance_message', 'We are making a few improvements. We still buy gold — connect with us on WhatsApp for instant valuations and same-day payments.'),
            ],
        ]);
    }

    /**
     * Admin: update settings (requires auth:sanctum).
     */
    public function update(Request $request): JsonResponse
    {
        $allowedKeys = [
            'business_name', 'tagline', 'phone', 'whatsapp', 'email',
            'address', 'opening_hours', 'logo_url', 'favicon_url', 'social_share_image', 'google_place_id',
            'google_review_url', 'trustpilot_url',
            'google_rating', 'total_reviews', 'years_in_business',
            'happy_customers', 'total_sales', 'gtm_id', 'ga_id', 'meta_pixel_id',
            'metal_api_key', 'metal_api_provider', 'google_api_key',
            'buying_percentage',
            'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
            'smtp_encryption', 'smtp_from_address', 'smtp_from_name',
            'admin_email', 'logo_size',
            'about_title', 'about_description', 'about_mission', 'about_vision', 'about_values',
            'top_bar_ticker', 'top_bar_ticker_speed',
            'newsletter_popup_enabled', 'newsletter_popup_title', 'newsletter_popup_message',
            'newsletter_popup_button_text', 'newsletter_popup_success_message',
            'newsletter_popup_delay_seconds', 'newsletter_popup_cookie_days', 'newsletter_popup_show_name',
            'maintenance_mode', 'maintenance_message',
        ];

        $data = $request->has('settings') ? $request->input('settings') : $request->all();

        $updated = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $allowedKeys)) {
                $type = match (true) {
                    in_array($key, ['google_rating', 'total_reviews', 'years_in_business',
                        'buying_percentage', 'smtp_port', 'logo_size', 'top_bar_ticker_speed',
                        'newsletter_popup_delay_seconds', 'newsletter_popup_cookie_days']) => 'number',
                    in_array($key, ['about_values', 'top_bar_ticker']) => 'json',
                    in_array($key, ['newsletter_popup_enabled', 'newsletter_popup_show_name', 'maintenance_mode']) => 'boolean',
                    default => 'text',
                };

                $group = match (true) {
                    str_starts_with($key, 'smtp_') || $key === 'admin_email' => 'email',
                    in_array($key, ['metal_api_key', 'metal_api_provider', 'buying_percentage']) => 'api',
                    str_starts_with($key, 'google_') => 'google',
                    in_array($key, ['gtm_id', 'ga_id', 'meta_pixel_id']) => 'tracking',
                    str_starts_with($key, 'about_') => 'about',
                    str_starts_with($key, 'top_bar_') => 'header',
                    str_starts_with($key, 'newsletter_popup_') => 'marketing',
                    str_starts_with($key, 'maintenance_') => 'general',
                    default => 'general',
                };

                Setting::set($key, $value, $type, $group, ucwords(str_replace('_', ' ', $key)));
                $updated[$key] = $value;
            }
        }

        // Default buying % only applies to newly added metals — use Admin → Metal Buying % for each metal.
        if (isset($updated['buying_percentage'])) {
            Cache::forget('metal_rates');
        }

        return response()->json(['message' => 'Settings updated', 'updated' => $updated]);
    }

    /**
     * Admin: upload a logo image file.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,gif,svg,webp|max:2048',
        ]);

        $file = $request->file('logo');
        $filename = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads'), $filename);

        $url = url('uploads/' . $filename);

        Setting::set('logo_url', $url, 'text', 'general', 'Logo URL');

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'logo_url' => $url,
        ]);
    }

    /**
     * Admin: get all settings including sensitive ones.
     */
    public function all(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json(['data' => $settings]);
    }

    /**
     * Admin: send a test email to verify SMTP settings.
     */
    public function testEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'smtp' => 'sometimes|array',
        ]);

        $smtpOverride = $request->input('smtp');
        $mailConfig = app(MailConfigService::class);
        $diag = $mailConfig->diagnostics($smtpOverride);
        $log = array_map(fn ($k, $v) => "{$k}: {$v}", array_keys($diag), array_values($diag));

        if (!$mailConfig->isConfigured($smtpOverride)) {
            $log[] = 'ERROR: SMTP host is required.';
            return response()->json([
                'ok' => false,
                'error' => 'SMTP host is required. Enter SMTP Host and try again.',
                'log' => $log,
            ], 400);
        }

        $password = $smtpOverride['smtp_password'] ?? Setting::get('smtp_password', '');
        if (empty($password)) {
            $log[] = 'ERROR: SMTP password is empty.';
            $log[] = 'HINT: Paste your Brevo SMTP key (SMTP & API → SMTP keys).';
            return response()->json([
                'ok' => false,
                'error' => 'SMTP password is missing.',
                'log' => $log,
            ], 400);
        }

        $port = (int) ($smtpOverride['smtp_port'] ?? Setting::get('smtp_port', 587));
        $encryption = strtolower((string) ($smtpOverride['smtp_encryption'] ?? Setting::get('smtp_encryption', 'tls')));
        if ($port === 587 && $encryption === 'ssl') {
            $log[] = 'WARNING: Port 587 with SSL is wrong — use Encryption: TLS for Brevo.';
        }

        $mailConfig->applyFromSettings($smtpOverride);
        $log[] = 'Sending test to: ' . $request->email;

        try {
            Mail::raw(
                'This is a test email from Fine Jewellery Buyers. If you received this, SMTP is working correctly.',
                function ($message) use ($request) {
                    $message->to($request->email)
                        ->subject('Test Email — Fine Jewellery Buyers');
                }
            );

            $log[] = 'SUCCESS: Email accepted by SMTP server.';
            Log::info('SMTP test email sent', ['to' => $request->email, 'diag' => $diag]);

            return response()->json([
                'ok' => true,
                'message' => 'Test email sent successfully',
                'log' => $log,
            ]);
        } catch (\Throwable $e) {
            $error = $e->getMessage();
            $log[] = 'ERROR: ' . $error;

            if ($port === 587) {
                $log[] = 'HINT: Brevo on port 587 needs Encryption = TLS (not SSL).';
            }
            if (str_contains(strtolower($error), 'authentication') || str_contains(strtolower($error), '535')) {
                $log[] = 'HINT: Check SMTP username/password in Brevo → SMTP & API.';
            }
            if (str_contains(strtolower($error), 'sender') || str_contains(strtolower($error), 'from')) {
                $log[] = 'HINT: Verify your From email as a sender in Brevo dashboard.';
            }
            if (str_contains(strtolower($error), 'connection') || str_contains(strtolower($error), 'timeout')) {
                $log[] = 'HINT: Hostinger may block outbound SMTP — try Brevo API or Hostinger email SMTP.';
            }

            Log::error('SMTP test failed', ['error' => $error, 'diag' => $diag, 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'ok' => false,
                'error' => $error,
                'log' => $log,
            ], 500);
        }
    }
}
