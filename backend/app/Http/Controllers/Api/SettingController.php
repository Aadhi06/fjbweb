<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MetalRate;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
                'address' => Setting::get('address', '88–90 Hatton Garden, 4th Floor, Office No. 39, London EC1N 8AA'),
                'opening_hours' => Setting::get('opening_hours', 'Mon–Sat: 10am–6pm'),
                'logo_url' => Setting::get('logo_url', ''),
                'logo_size' => (int) Setting::get('logo_size', 48),
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
            'address', 'opening_hours', 'logo_url', 'google_place_id',
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
                    in_array($key, ['newsletter_popup_enabled', 'newsletter_popup_show_name']) => 'boolean',
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
                    default => 'general',
                };

                Setting::set($key, $value, $type, $group, ucwords(str_replace('_', ' ', $key)));
                $updated[$key] = $value;
            }
        }

        if (isset($updated['buying_percentage'])) {
            MetalRate::query()->update(['buying_percentage' => (float) $updated['buying_percentage']]);
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
}
